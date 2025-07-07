const express = require("express");
const morgan = require("morgan");
const colors = require("colors");
const dotenv = require("dotenv");
const cors = require("cors");
const { connectDB } = require("./config/database");

// ✅ Load env variables
dotenv.config();

// ✅ Connect to Database
connectDB();

// ✅ Create Express App
const app = express();

// ✅ Middleware
app.use(express.json());
app.use(morgan("dev"));

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  })
);

// ✅ Routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/v1/auth", authRoutes);

// ✅ Root Route
app.get("/", (req, res) => {
  res.status(200).json({ message: "API is running..." });
});

// ✅ Define Port
const PORT = process.env.NODE_TRADERSROOM_PORT || 8080;

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_TRADERSROOM_MODE} mode`.bgCyan.white);
});
