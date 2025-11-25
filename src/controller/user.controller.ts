import { Request, Response } from "express";
import { Role, Status, User } from "../model/userModel";
import bcrypt from "bcryptjs"
import { signAccessToken, signRefreshToken } from "../utils/token";
import  Jwt  from "jsonwebtoken"
import dotenv from "dotenv"
import { AuthRequest } from "../middleware/authenticate";
dotenv.config()

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string

export const registerUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password, confirmPassword } = req.body;
        let role = Role.USER
        let status = Status.ACTIVE

        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role,
            status
        });


        await newUser.save();

        res.status(201).json({
            message: "User registered successfully",
            data: {
                id: newUser._id,
                email: newUser.email,
                role: newUser.role,
                status: newUser.status
            }
        });

    } catch (error) {
        res.status(500).json({ message: "User registration failed" });
    }

}

export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (user.status == Status.INACTIVE) {
            return res.status(401).json({ message: "User is inactive" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const accessToken = signAccessToken(user);
        const refreshToken = signRefreshToken(user);

        res.status(200).json({
            message: "Login successful",
            data: {
                email: user.email,
                role: user.role,    
                accessToken,
                refreshToken
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Login failed" });
    }

}

export const handleRefreshToken = async (req: Request, res: Response) => {
    try {
        const { token } = req.body

        if (!token) {
            return res.status(400).json({ message: "Invalid or expired token" })
        }

        const payload = Jwt.verify(token, JWT_REFRESH_SECRET)
        const user = await User.findById(payload.sub)

        if (!user) {
            return res.status(404).json({ message: "Invalid or expired token" })
        }
        
        const accessToken = signAccessToken(user)
        res.status(200).json({ accessToken })


    } catch (error) {
        res.status(500).json({ message: "Invalid or expired token" })        
    }
}

export const getMyDetails = async (req: AuthRequest, res: Response) => {

    if(!req.user){
        return res.status(401).json({ message: "Unauthorized" })
    }

    const userId = req.user.sub

    try {
        const user = await User.findById(userId)
        res.status(200).json({ data: user })
    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }
}