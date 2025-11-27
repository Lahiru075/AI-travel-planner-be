import mongoose, { Document } from "mongoose";

export interface ITrip extends Document {
    _id: mongoose.Types.ObjectId,
    user: mongoose.Types.ObjectId,
    destination: string,
    noOfData: number,
    budget: number,
    travelers: string,
    tripDate: Date,
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
    noOfData: {
        type: Number,
        required: true
    },
    budget: {
        type: Number,
        required: true
    },
    travelers: {
        type: String,
        required: true
    },
    tripDate: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

export const Trip = mongoose.model<ITrip>("Trip", tripSchema);