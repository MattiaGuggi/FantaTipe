import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import http from 'http';
import { connectDB } from './DB/database.js';
import { initSocket } from './utils/socketUtils.js';
import authRoutes from './routes/authRoutes.js';
import { Server } from 'socket.io';

dotenv.config();
const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL;
const __dirname = path.resolve();
const app = express();
const server = http.createServer(app);
const corsOptions = {
    origin: CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
const io = new Server(server, {
    cors: {
        origin: CLIENT_URL,
        methods: ["GET", "POST"],
    },
});

// Middleware
app.use(express.json());
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Routes
app.use('/', authRoutes(io));

// Serve static files in production
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "/client/dist")));
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
    });
}

// Initialize Socket.io
initSocket(io);

// Start server
server.listen(PORT, () => {
    connectDB();
    console.log(`Server started on port ${PORT}`);
});
