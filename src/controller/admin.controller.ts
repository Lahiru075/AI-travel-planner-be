import { Request, Response } from "express";
import { Role, Status, User } from "../model/userModel";
import { Trip } from "../model/trip.model";

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const totalUsers = await User.countDocuments({ role: Role.USER });
        const totalTrips = await Trip.countDocuments();

        const activeUsers = await User.countDocuments({ status: Status.ACTIVE });
        const suspendUsers = await User.countDocuments({ status: Status.SUSPEND });

        // 👇 1. මේ මාසයේ මුල් දිනය ගන්නවා
        const date = new Date();
        const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);

        // 👇 2. DAILY CHART DATA (මේ මාසේ දත්ත විතරයි)
        const tripStats = await Trip.aggregate([
            {
                $match: {
                    createdAt: { $gte: firstDayOfMonth } // මේ මාසෙට අදාළ ඒවා විතරක් තෝරනවා
                }
            },
            {
                $group: {
                    _id: { $dayOfMonth: "$createdAt" }, // දවස අනුව Group කරනවා (1, 2, 3...)
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } } // මුල් දවසේ ඉඳන් අගට පෙළගස්වනවා
        ]);

        // Chart එකට ඕන විදිහට Data Format කරනවා
        const chartData = tripStats.map(item => ({
            name: `Day ${item._id}`, // Ex: "Day 5"
            trips: item.count
        }));

        res.status(200).json({
            data: {
                totalTrips,
                totalUsers,
                activeUsers,
                suspendUsers,
                chartData
            }
        })

    } catch (error: any) {
        res.status(500).json({ message: "Error fetching dashboard stats" })
    }
}

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find({ role: Role.USER }).select('-password').sort({ createdAt: -1 })

        res.status(200).json({ data: users })

    } catch (error) {
        res.status(500).json({ message: "Error fetching users" })
    }
}

export const getAllTrips = async (req: Request, res: Response) => {
    try {
        const trips = await Trip.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 })

        res.status(200).json({ data: trips })
    } catch (error) {
        res.status(500).json({ message: "Error fetching trips" })
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

export const deleteTrip = async (req: Request, res: Response) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({ message: "Trip ID is required" })
        }

        await Trip.findByIdAndDelete(id)

        res.status(200).json({ message: "Trip deleted successfully" })

    } catch (error) {
        res.status(500).json({ message: "Error deleting trip" })
    }
 }