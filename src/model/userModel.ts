import mongoose, { Document } from "mongoose";

export enum Role {
    ADMIN = "ADMIN",
    USER = "USER"
}

export enum Status {
    ACTIVE = "ACTIVE",
    SUSPEND = "SUSPEND",
}

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    password: string;
    role: Role[];
    status: Status;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: [String],
        enum: Object.values(Role),
        default: [Role.USER]
    },
    status: {
        type: String,
        enum: Object.values(Status),
        default: Status.ACTIVE
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
}, {
    timestamps: true
});

export const User = mongoose.model<IUser>("User", userSchema);