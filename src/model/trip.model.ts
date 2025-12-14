import mongoose, { Document } from "mongoose";

export interface ITrip extends Document {
    _id: mongoose.Types.ObjectId,
    user: mongoose.Types.ObjectId,
    destination: string,
    noOfDays: number,
    budget: string,
    travelers: string,
    tripData: {
        tripName: string;
        hotels: string[];
        itinerary: {
            day: number;
            plan: {
                time: string;
                place: string;
                details: string;
                ticketPrice: string;
            }[];
        }[];
    },
    isPublic: boolean,
}

const tripSchema = new mongoose.Schema<ITrip>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    noOfDays: {
        type: Number,
        required: true
    },
    budget: {
        type: String,
        required: true
    },
    travelers: {
        type: String,
        required: true
    },
    tripData: {
        type: Object,
        required: true
    },
    isPublic: {
        type: Boolean,
        default: false 
    }
}, {
    timestamps: true
});

export const Trip = mongoose.model<ITrip>("Trip", tripSchema);