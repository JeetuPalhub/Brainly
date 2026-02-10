import express from "express";
import dotenv from "dotenv";
import connectDB from "./db";
import cors from "cors";
import authRoutes from "./routes/auth";
import contentRoutes from "./routes/content";
import brainRoutes from "./routes/brain";
import collectionRoutes from "./routes/collections";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3001';
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX || 300);

const requestBuckets = new Map<string, { count: number; windowStart: number }>();

const securityHeaders = (_req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
};

const rateLimitMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const existing = requestBuckets.get(ip);

    if (!existing || now - existing.windowStart > RATE_LIMIT_WINDOW_MS) {
        requestBuckets.set(ip, { count: 1, windowStart: now });
        return next();
    }

    existing.count += 1;
    if (existing.count > RATE_LIMIT_MAX) {
        return res.status(429).json({ message: 'Too many requests. Please try again later.' });
    }

    return next();
};

app.use(cors({
    origin: CORS_ORIGIN,
    credentials: true
}));

app.use(securityHeaders);
app.use(rateLimitMiddleware);
app.use(express.json());

connectDB();

app.get("/", (req, res) => {
    res.json({ message: "Second Brain API is running!"});
});

app.use("/api/v1", authRoutes);
app.use("/api/v1/content", contentRoutes);
app.use("/api/v1/collections", collectionRoutes);
app.use("/api/v1/brain", brainRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
