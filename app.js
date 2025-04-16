
import express, { json } from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import drugRoutes from "./routes/drugRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js"
import session from "express-session";


const app = express();
// CORS configuration
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(
    session({
      secret: "eaf7c3e0684c0820e0b9524884d1b933507a5a9d0d6ba0b6396922ee1454b5da97cc65df443f4fbf532a5a87e844e4501289910d5e243d036f35cade75e5545b25665736dee87b6b7f9e83847cc2295c0d3f8dbe4dfd3806cb0b8a83620a70bc72bf955b78b8b65ce61de674d775744d2d696d9a406dfe0805679575421b4704f5beff4f592c8f7cf8a466b6720fd1582c6016d39c5911e35daa379938df93bb8ccca6a4855becdf4cc8157399f639e387109355ee547e463f846af900a9dc19ddcff68b1aba3aca599501c481d70cc21fdaa01df27e33a2016f7c46548b3d76de70fefe9cf86fdfa0207ab9783fe62d7db9eb42e2091621ca1ddda89a422a09", // Replace with a strong secret key
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false },
      sameSite: "lax", // Set to true if using HTTPS
    })
  );

// Middleware

app.use(json());

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/drugs", drugRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);


// Database connection
connectDB();

export default app;
