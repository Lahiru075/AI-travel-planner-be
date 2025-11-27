import axios from "axios";
import { Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

export const generateTrip = async (req: Request, res: Response) => {
    
    const { destination, noOfDays, budget, travelers } = req.body;

    if (!destination || !noOfDays || !budget || !travelers) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // AI Prompt
    const prompt = `
        Generate a travel itinerary for:
        Location: ${destination}
        Duration: ${noOfDays} Days
        Budget: ${budget}
        Travelers: ${travelers}

        Please provide the output strictly in JSON format. Do not add any extra text, markdown, or code blocks (like \`\`\`json).
        The JSON object should have this structure:
        {
            "tripName": "Trip to ${destination}",
            "hotels": ["Hotel 1", "Hotel 2", "Hotel 3"],
            "itinerary": [
            {
                "day": 1,
                "plan": [
                { "time": "Morning", "place": "Place Name", "details": "Activity details", "ticketPrice": "approx cost" },
                { "time": "Afternoon", "place": "...", "details": "...", "ticketPrice": "..." },
                { "time": "Evening", "place": "...", "details": "...", "ticketPrice": "..." }
                ]
            }
            ]
        }
    `;

    try {
        // 👇 වෙනස් කළ තැන: Model එක 'gemini-2.0-flash' වලට මාරු කළා (ඔයාගේ කලින් කෝඩ් එකේ වගේ)
        const response = await axios.post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
            {
                contents: [
                    {
                        parts: [{ text: prompt }]
                    }
                ]
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-goog-api-key": process.env.GEMINI_API_KEY as string // .env එකේ Key එක හරියට තියෙන්න ඕන
                }
            }
        );

        // Data Extract
        let generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
            return res.status(500).json({ message: "AI did not return any text." });
        }

        // Clean JSON
        generatedText = generatedText.replace(/```json/g, "").replace(/```/g, "").trim();
        
        const tripData = JSON.parse(generatedText);

        res.status(200).json(tripData);

    } catch (error: any) {
        console.error("AI Error:", error.response?.data || error.message);
        
        // Error එක මොකක්ද කියලා හරියටම බලාගන්න
        res.status(500).json({ 
            message: "AI Generation Failed", 
            error: error.response?.data || error.message 
        });
    }
};