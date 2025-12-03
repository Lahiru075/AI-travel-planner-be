import axios from "axios";
import { Request, Response } from "express";
import dotenv from "dotenv";
import { Trip } from "../model/trip.model";
import { AuthRequest } from "../middleware/authenticate";

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
                        { 
                            "time": "Morning", 
                            "place": "Place Name", 
                            "details": "Activity details", 
                            "ticketPrice": "approx cost", 
                            "geoCoordinates": { "lat": 6.9271, "lng": 79.8612 } 
                        },
                        { 
                            "time": "Afternoon", 
                            "place": "...", 
                            "details": "...", 
                            "ticketPrice": "...",
                            "geoCoordinates": { "lat": 0.0, "lng": 0.0 } 
                        },
                        { 
                            "time": "Evening", 
                            "place": "...", 
                            "details": "...", 
                            "ticketPrice": "...",
                            "geoCoordinates": { "lat": 0.0, "lng": 0.0 } 
                        }
                    ]
                }
            ]
        }
    `;

    try {

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
                    "X-goog-api-key": process.env.GEMINI_API_KEY as string
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

        res.status(500).json({
            message: "AI Generation Failed",
            error: error.response?.data || error.message
        });
    }
};


export const saveTrip = async (req: Request, res: Response) => {

    try {

        const { userId, tripData, destination, noOfDays, budget, travelers } = req.body;

        if (!userId || !tripData || !destination || !noOfDays || !budget || !travelers) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newTrip = new Trip({
            user: userId,
            destination,
            noOfDays,
            budget,
            travelers,
            tripData
        })

        await newTrip.save()

        res.status(200).json({ message: "Trip saved successfully" })

    } catch (error: any) {

        res.status(500).json({ message: error.message })

    }
}

export const getMyTrips = async (req: AuthRequest, res: Response) => {

    try {
        const userId = req.user.sub

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 10
        const skip = (page - 1) * limit


        const trips = await Trip.find({ user: userId })
            .populate("user")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        const total = await Trip.countDocuments({ user: userId })

        res.status(200).json({
            message: "Trips fetched successfully",
            data: trips,
            totalPages: Math.ceil(total / limit),
            totalCount: total,
            page
        })

    } catch (error: any) {

        res.status(500).json({ message: error.message })

    }
}

export const deleteTrip = async (req: Request, res: Response) => {

    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({ message: "Trip ID is required" })
        }

        await Trip.findByIdAndDelete(id)

        res.status(200).json({ message: "Trip deleted successfully" })

    } catch (error: any) {

        res.status(500).json({ message: error.message })

    }
}

export const getTripById = async (req: Request, res: Response) => {

    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({ message: "Trip ID is required" })
        }

        const trip = await Trip.findById(id)

        if (!trip) {
            return res.status(404).json({ message: "Trip not found" })
        }

        res.status(200).json({ data: trip })

    } catch (error: any) {

        res.status(500).json({ message: error.message })

    }
}

export const getAllTrips = async (req: Request, res: Response) => {
    try {

        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 10
        const skip = (page - 1) * limit

        const trips = await Trip.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        const total = await Trip.countDocuments()

        res.status(200).json({ 
            message: "Trips fetched successfully",
            data: trips,
            totalPages: Math.ceil(total / limit),
            totalCount: total,
            page 
        })

    } catch (error) {
        res.status(500).json({ message: "Error fetching trips" })
    }
}


// Pexels Image Fetch Function
export const getPlaceImage = async (req: Request, res: Response) => {
    try {
        const { query } = req.body; // Ex: "Kandy, Sri Lanka"

        if (!query) return res.status(400).json({ message: "Query is required" });

        const unsplashUrl = `https://api.unsplash.com/search/photos?query=${query}&per_page=1&orientation=landscape`;

        const response = await axios.get(unsplashUrl, {
            headers: {

                Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
            }
        });

        if (response.data.results.length > 0) {
            return res.status(200).json({ imageUrl: response.data.results[0].urls.regular });
        } else {
            return res.status(200).json({ imageUrl: null });
        }

    } catch (error: any) {
        console.error("Unsplash Error:", error.message);
        res.status(200).json({ imageUrl: null });
    }
};


export const getWeatherInfo = async (req: Request, res: Response) => {
    try {
        const { location } = req.body; // Ex: "Kandy"
        if (!location) return res.status(400).json({ message: "Location required" });

        const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`;

        const response = await axios.get(url);

        const weatherData = {
            temp: Math.round(response.data.main.temp),
            condition: response.data.weather[0].main,
            description: response.data.weather[0].description,
            icon: response.data.weather[0].icon
        };

        res.status(200).json(weatherData);

    } catch (error: any) {
        console.error("Weather Error:", error.message);
        res.status(500).json({ message: "Failed to fetch weather" });
    }
};