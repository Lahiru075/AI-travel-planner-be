import { Request, Response } from "express";
import { Role, Status, User } from "../model/userModel";
import bcrypt from "bcryptjs"
import { signAccessToken, signRefreshToken } from "../utils/token";
import Jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { AuthRequest } from "../middleware/authenticate";
import { OAuth2Client } from "google-auth-library";
import nodemailer from "nodemailer";
import cloudinary from "../config/cloudinary";
import crypto from "crypto";
dotenv.config()

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

        if (user.status == Status.SUSPEND) {
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

    if (!req.user) {
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

export const googleLogin = async (req: Request, res: Response) => {
    try {
        const { token } = req.body;

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload) return res.status(400).json({ message: "Invalid Google Token" });

        const { email, name, picture } = payload; // token eka valid nam me widiyata data gannawa...

        let user = await User.findOne({ email });

        // mehema user kenek neththan user kenek create karanawa....
        if (!user) {
            const randomPassword = Math.random().toString(36).slice(-8); // random password create karanawa

            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            user = new User({
                name,
                email,
                password: hashedPassword,
                role: "USER",
                status: "ACTIVE"
            });

            await user.save();

        }

        // ita psse user login karanawa...

        const accessToken = signAccessToken(user);

        const refreshToken = signRefreshToken(user);

        res.status(200).json({
            message: "Google Login successful",
            data: {
                email: user.email,
                role: user.role,
                accessToken,
                refreshToken
            }
        });

    } catch (error: any) {
        console.log(error.message);
        res.status(500).json({ message: "Google Login Failed" });
    }
}

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const resetToken = crypto.randomBytes(20).toString("hex");


        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
        await user.save();

        // const transporter = nodemailer.createTransport({
        //     service: "gmail",
        //     auth: {
        //         user: process.env.EMAIL_USER,
        //         pass: process.env.EMAIL_PASS,
        //     },
        // });

        // mailtrap site eke sandbox eke thamai save wenne
        const transporter = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: process.env.MAILTRAP_USER as string,
                pass: process.env.MAILTRAP_PASS as string
            }
        });

        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

        // const mailOptions = {
        //     from: process.env.EMAIL_USER,
        //     to: user.email,
        //     subject: "Password Reset Request",
        //     text: `You requested a password reset. Click this link to reset: ${resetUrl}`,
        //     html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`
        // };


        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Password Reset Request",
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8" />
                    <title>Password Reset</title>
                </head>
                <body style="margin:0; padding:0; background-color:#f4f6f8; font-family: Arial, sans-serif;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td align="center" style="padding:40px 0;">
                        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
                            
                            <!-- Header -->
                            <tr>
                            <td style="background:#2563eb; padding:20px; text-align:center; color:#ffffff;">
                                <h1 style="margin:0; font-size:24px;">Password Reset</h1>
                            </td>
                            </tr>

                            <!-- Body -->
                            <tr>
                            <td style="padding:30px; color:#333333;">
                                <p style="font-size:16px; margin:0 0 15px;">
                                Hello <strong>${user.name || "User"}</strong>,
                                </p>

                                <p style="font-size:15px; line-height:1.6;">
                                We received a request to reset your password.  
                                Click the button below to securely reset your password.
                                </p>

                                <!-- Button -->
                                <div style="text-align:center; margin:30px 0;">
                                <a href="${resetUrl}"
                                    style="background:#2563eb; color:#ffffff; padding:14px 28px; text-decoration:none; font-size:16px; border-radius:6px; display:inline-block;">
                                    Reset Password
                                </a>
                                </div>

                                <p style="font-size:14px; color:#555;">
                                If you did not request this, please ignore this email.  
                                Your password will remain unchanged.
                                </p>

                                <p style="font-size:14px; margin-top:25px;">
                                Regards,<br />
                                <strong>Data Minds Team</strong>
                                </p>
                            </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                            <td style="background:#f1f5f9; padding:15px; text-align:center; font-size:12px; color:#777;">
                                © ${new Date().getFullYear()} Data Minds. All rights reserved.
                            </td>
                            </tr>

                        </table>
                        </td>
                    </tr>
                    </table>
                </body>
                </html>
            `
        };



        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "Email sent successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Email could not be sent" });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        user.password = await bcrypt.hash(password, 10);

        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ message: "Password updated successfully" });

    } catch (error) {
        res.status(500).json({ message: "Error resetting password" });
    }
};

export const getAllUsers = async (req: Request, res: Response) => {
    try {

        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 10
        const skip = (page - 1) * limit

        const users = await User.find({ role: Role.USER })
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        const total = await User.countDocuments({ role: Role.USER })

        res.status(200).json({
            message: "Users fetched successfully",
            data: users,
            totalPages: Math.ceil(total / limit),
            totalCount: total,
            page
        })

    } catch (error) {
        res.status(500).json({ message: "Error fetching users" })
    }
}

export const suspendUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({ message: "User ID is required" })
        }

        await User.findByIdAndUpdate(id, { status: Status.SUSPEND }, { new: true })

        res.status(200).json({ message: "User suspended successfully" })


    } catch (error) {
        res.status(500).json({ message: "Error suspending user" })
    }
}

export const activateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({ message: "User ID is required" })
        }

        await User.findByIdAndUpdate(id, { status: Status.ACTIVE }, { new: true })

        res.status(200).json({ message: "User activated successfully" })

    } catch (error) {
        res.status(500).json({ message: "Error activating user" })
    }
}

export const updateProfile = async (req: Request | any, res: Response) => {
    try {
        const userId = req.user.sub;

        const { name, email, password } = req.body;

        let user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (req.file) {
            const result: any = await new Promise((resole, reject) => {
                const upload_stream = cloudinary.uploader.upload_stream(
                    { folder: "Ai_trip_planner" },
                    (error, result) => {
                        if (error) {
                            console.error(error)
                            return reject(error)
                        }
                        resole(result)
                    }
                )
                upload_stream.end(req.file?.buffer)
            })
            user.profilePicture = result.secure_url;
        }

        if (name) user.name = name;
        if (email) {
            const emailExists = await User.findOne({ email });
            if (emailExists && emailExists._id.toString() !== userId) {
                return res.status(400).json({ message: "Email already in use" });
            }
            user.email = email;
        }

        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            data: {
                _id: user._id,
                email: user.email,
                role: user.role,
                status: user.status,
                name: user.name,
                profilePicture: user.profilePicture
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating profile" });
    }
};
