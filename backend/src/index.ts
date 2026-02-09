import express from "express";
import dotenv from "dotenv";
import connectDB from "./db";
import authRoutes from "./routes/auth";
import contentRoutes from "./routes/content";
import brainRoutes from "./routes/brain";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

connectDB();

app.get("/", (req, res) => {
    res.json({ message: "Second Brain API is runnning!"});
});

app.use("/api/v1", authRoutes);
app.use("/api/v1/content", contentRoutes);
app.use("/api/v1/brain", brainRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
