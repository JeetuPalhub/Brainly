import express from "express";
import dotenv from "dotenv";
import connectDB from "./db";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

connectDB();

app.get("/", (req, res) => {
    res.json({ message: "Second Brain API is runnning!"});
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
