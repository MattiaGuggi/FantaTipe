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
import session from 'express-session';
import MongoStore from 'connect-mongo';

dotenv.config();
const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL;
const __dirname = path.resolve();
const app = express();
const server = http.createServer(app);

const corsOptions = {
    origin: CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

const io = new Server(server, {
    cors: corsOptions
});

// Middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: 'mongodb+srv://mattiahag:Mattiaha2006@fantatipe.9578t.mongodb.net/sessions' }),
    cookie: { secure: process.env.NODE_ENV === 'production' }, // Secure cookie in production
}));
app.use(express.json());
app.use(bodyParser.json());
app.use(cors(corsOptions));

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