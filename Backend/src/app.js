const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

// ================= RATE LIMIT =================
// 🌐 General limiter (LIGHT - optional)
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

// ================= ROUTES =================
const authRouter = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.routes");

// Apply only general limiter globally
app.use(generalLimiter);

// Routes (NO AI limiter here)
app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);

// ================= EXPORT =================
module.exports = app;
