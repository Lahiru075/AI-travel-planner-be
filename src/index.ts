import express from "express"
import cors from "cors"
import dotenv from "dotenv";
import mongoose from "mongoose";
import userRoutes from "./routes/user.routes";
import tripRoutes from "./routes/trip.routes";
import adminRoutes from "./routes/admin.routes";
dotenv.config();

const SERVER_PORT = process.env.SERVER_PORT
const MONGO_URI = process.env.MONGO_URI as string

const app = express()

app.use(express.json())

app.use(
    cors({
        origin: ["http://localhost:5173"],
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    })
);


app.use("/api/v1/users", userRoutes)
app.use("/api/v1/trips", tripRoutes)
app.use("/api/v1/admin", adminRoutes)

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log("DB connected")
    })
    .catch((err) => {
        console.log(`DB connection fail: ${err}`)
        process.exit(1)
    })

app.listen(SERVER_PORT, () => {
    console.log(`Server is running on port ${SERVER_PORT}`)
});