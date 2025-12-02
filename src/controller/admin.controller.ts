import { Request, Response } from "express";
import { Role, Status, User } from "../model/userModel";
import { Trip } from "../model/trip.model";

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const totalUsers = await User.countDocuments({ role: Role.USER });
        const totalTrips = await Trip.countDocuments();

        const activeUsers = await User.countDocuments({ status: Status.ACTIVE });
        const suspendUsers = await User.countDocuments({ status: Status.SUSPEND });

        const date = new Date();
        const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);

        const tripStats = await Trip.aggregate([
            {
                $match: {
                    createdAt: { $gte: firstDayOfMonth } 
                }
            },
            {
                $group: {
                    _id: { $dayOfMonth: "$createdAt" }, 
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } } 
        ]);

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