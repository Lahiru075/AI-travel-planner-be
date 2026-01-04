# 🌍 AI Travel Planner - Backend API

> This is the server-side application for the AI Travel Planner, built with Node.js, Express, and TypeScript. It handles authentication, AI itinerary generation, and data management.

## 🚀 Live Demo
**Backend URL:** [Link to your Render Deployment] 
**Frontend Repository:** [[Link to Frontend GitHub Repo](https://github.com/Lahiru075/AI-travel-planner-fe.git)]

---

## 🛠️ Technologies & Tools Used

*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Language:** TypeScript
*   **Database:** MongoDB (via Mongoose)
*   **Authentication:** JSON Web Tokens (JWT) & Google OAuth
*   **AI Integration:** Google Gemini 1.5 Flash
*   **Image Storage:** Cloudinary
*   **Email Service:** Nodemailer (Mailtrap for testing)
*   **External APIs:**
    *   Unsplash API (Dynamic Images)
    *   OpenWeatherMap API (Weather Data)

---

## ✨ Key Features

*   **🔐 Secure Authentication:**
    *   User Sign up & Login (with bcrypt encryption).
    *   Google Authentication (OAuth 2.0).
    *   JWT-based protected routes.
    *   Forgot Password & Reset Password flows via Email.
*   **🤖 AI Trip Generation:**
    *   Generates personalized day-by-day itineraries using **Google Gemini AI**.
    *   Provides hotel recommendations and ticket prices.
    *   Fetches geo-coordinates for mapping.
*   **☁️ 3rd Party API Integration:**
    *   **Unsplash/Pexels Proxy:** Fetches destination images securely from the backend to avoid CORS issues.
    *   **OpenWeatherMap Proxy:** Fetches real-time weather data.
*   **👤 User Management:**
    *   Profile update with image upload (Cloudinary).
    *   Trip History management (Save/Delete trips).
*   **🛡️ Admin Panel API:**
    *   Manage Users (Suspend/Activate).
    *   Manage Trips (Delete inappropriate content).
    *   Dashboard Statistics (Growth charts & data).

---

## ⚙️ Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file in the root directory.

| Variable | Description |
| :--- | :--- |
| `PORT` | Port number (e.g., 5000) |
| `MONGO_URL` | MongoDB connection string |
| `JWT_SECRET` | Secret key for access tokens |
| `REFRESH_TOKEN_SECRET` | Secret key for refresh tokens |
| `GEMINI_API_KEY` | Google Gemini AI API Key |
| `UNSPLASH_ACCESS_KEY` | Unsplash API Access Key |
| `OPENWEATHER_API_KEY` | OpenWeatherMap API Key |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `EMAIL_USER` | Email address for Nodemailer |
| `EMAIL_PASS` | App Password for Email |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name |
| `CLOUDINARY_API_KEY` | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret |

---

## 💻 Setup & Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Lahiru075/AI-travel-planner-be.git
    cd your-backend-repo
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables**
    *   Create a `.env` file in the root directory.
    *   Copy the variables from the table above and fill in your keys.

4.  **Run the Server**
    *   **Development Mode:**
        ```bash
        npm run dev
        ```
    *   **Production Build:**
        ```bash
        npm run build
        npm start
        ```

---

## 📂 Project Structure
```bash
src/
├── config/         # Database & Cloudinary configurations
├── controller/     # Logic for API endpoints (Auth, Trip, Admin, User)
├── middleware/     # Auth & Admin verification middleware
├── models/         # Mongoose Schemas (User, Trip)
├── routes/         # API Route definitions
└── index.ts        # Entry point
```
---

## 🔗 API Endpoints Overview

### Auth
*   `POST /api/users/signin` - User Login
*   `POST /api/users/register` - User Registration
*   `POST /api/users/google-login` - Google OAuth
*   `POST /api/users/forgot-password` - Send Reset Link

### Trips
*   `POST /api/trips/generate-trip` - Generate AI Plan
*   `POST /api/trips/save-trip` - Save Plan to DB
*   `GET /api/trips/user-trips/:userId` - Get User History
*   `POST /api/trips/get-image` - Fetch Image (Proxy)
*   `POST /api/trips/get-weather` - Fetch Weather (Proxy)

### Admin
*   `GET /api/admin/stats` - Dashboard Statistics
*   `GET /api/admin/users` - Get All Users
*   `PUT /api/admin/users/suspend/:id` - Suspend User

---

## 👨‍💻 Author

*   **Lahiru Lakshan** - [GitHub Profile](https://github.com/Lahiru075)
