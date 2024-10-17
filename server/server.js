import express from 'express'; 
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import crypto from 'crypto';
import path from 'path';
import http from 'http';
import { PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE } from "./mailtrap/emailTemplates.js";
import { mailtrapClient, sender } from "./mailtrap/mailtrap.config.js";
import { connectDB, getUsersFromDB, createUser, findUser, updateUser, updateFormations } from './DB/database.js';
import { getTrendingProfiles } from './points/trendingProfiles.js';
import { Server } from 'socket.io';

const PORT = process.env.PORT;
const CLIENT_URL = process.env.CLIENT_URL;
const API_URL = process.env.NODE_ENV === "development" ? "http://localhost:8080" : "";
const __dirname = path.resolve();
const corsOptions = {
    origin: CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: CLIENT_URL,
        methods: ["GET", "POST"]
    }
});
const MAX = 7;
let currentUser;

io.on('connection', (socket) => {
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
});

dotenv.config();
app.use(express.json());
app.use(cors(corsOptions));
app.use(bodyParser.json());

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await findUser({ email: email });

    if (user) { 
        if (user.password === password) {
            res.json({
                success: true,
                message: 'Login successful',
                user: {
                    email: user.email,
                    username: user.username,
                    points: user.points,
                    pfp: user.pfp
                }
            });
        } else {
            res.json({ success: false, message: 'Invalid password' });
        }
    } else {
        res.json({ success: false, message: 'User does not exist' });
    }
}); 

app.post('/signup', async (req, res) => {
    const { email, password, username } = req.body;

    // Check for existing user
    const existingUser = await findUser({ email: email }); 
    const existingUsername = await findUser({ username: username });

    if (existingUser)
        return res.json({ success: false, message: 'Email already in use' });
    if (existingUsername)
        return res.json({ success: false, message: 'Username already in use' });
    
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationTokenExpiresIn = new Date(Date.now() + 60 * 60 * 1000); // 1hour time

    const newUser = {
        email,
        password,
        username,
        points: 0,
        formation: [],
        pfp: 'https://www.starksfamilyfh.com/image/9/original',
        verificationToken: verificationToken,
        expiresIn: verificationTokenExpiresIn
    };

    // Save new user to database
    currentUser = newUser;
    await sendVerificationEmail(email, verificationToken);

    res.json({
        success: true,
        message: 'Sign up successful, user created',
        user: newUser
    });
});

app.post('/auth/verify-email', async (req, res) => {
    const { email, code } = req.body;

    try {
        if (!currentUser) { // Check if the token matches
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        if (currentUser.verificationToken != code) { // Check if the token matches
            return res.status(400).status({ success: false, message: 'Invalid verification code' });
        }
        
        const currentTime = new Date();
        if (currentTime > currentUser.expiresIn) { // Check if the token has expired
            return res.status(400).json({ success: false, message: 'Token expired, user deleted' });
        }

        // Token is valid, mark user as verified
        await createUser(currentUser);

        return res.json({ success: true, message: 'Email verified successfully, user created' });
    } catch (err) {
        console.error('Error verifying email', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    const user = await findUser({ email: email });

    if (user) {
        const resetToken = crypto.randomBytes(20).toString("hex");
        await sendPasswordResetEmail(email, `${API_URL}/auth/reset-password/${resetToken}?token=${resetToken}&email=${email}`);
        res.json({ success: true, message: "Password reset link sent to your email", token: resetToken });
    }
    else
        return res.json({ success: false, message: "User not found" });
});

app.post('/auth/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { email, newPassword } = req.body;

    const user = await findUser({ email: email });

    if (user) {
        user.password = newPassword;
        await updateUser(user);
        await sendPasswordResetEmailSuccessfull(email);
        res.json({ success: true, message: 'Password reset successful', token });
    }
    else
        res.json({ success: false, message: 'User not found' });
});

app.get('/auth/reset-password/:token', (req, res) => {
    const { token } = req.params;
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email not provided' });
    }

    res.redirect(`${CLIENT_URL}/reset-password?token=${token}&email=${email}`);
});

app.get('/search', async (req, res) => {
    const users = await getUsersFromDB();
    res.json(users);
});

app.get('/profile/:username', async (req, res) => {
    const { username } = req.params;

    const user = await findUser({ username: username });

    if (user) {
        res.json({
            success: true,
            user: user
        });
    }
    else
        res.status(404).json({ success: false, message: 'User not found' });
});

app.post('/update-profile', async (req, res) => {
    const { email, username, password, pfp } = req.body;

    const user = await findUser({ email: email });

    if (user) {
        const oldUsername = user.username;

        user.username = username;
        user.password = password;
        user.pfp = pfp;

        await updateUser(user);
        
        await updateFormations(oldUsername, username); // Update other users' formations where the old username exists

        res.json({
            success: true,
            message: 'Profile and formations updated successfully',
            user,
        });
    }
    else
        res.status(404).json({ success: false, message: 'User not found' });
});

app.post('/formation', async (req, res) => {
    const { email } = req.body;

    const user = await findUser({ email: email });

    if (user)
        res.json({ success: true, message: 'Formation found!', formation: user.formation });
    else
        res.json({ success: false, message: 'User not found' });
});

app.post('/update-formation', async (req, res) => {
    const { email, formation } = req.body;

    const user = await findUser({ email: email });
    if (user) {
        if (formation.length > MAX) {
            return res.json({
                success: false,
                message: 'Formation cannot exceed ' + MAX + ' items'
            });
        }

        user.formation = formation;
        await updateUser(user);
        res.json({ success: true, user });
    }
    else
        res.json({ success: false, message: 'User not found' });
});

app.get('/get-formation/:username', async (req, res) => {
    const username = req.params.username;

    const user = await findUser({ username: username });

    if (user) {
        res.json({ formation: user.formation || '' });
    }
    else
        return res.status(404).json({ message: 'User not found' });
});

app.get('/get-users', async (req, res) => {
    const users = await getUsersFromDB();
    res.json({ users });
});

app.post('/update-points', async (req, res) => {
    const { user } = req.body;
    try {
        const users = await getUsersFromDB();
        const trendingProfiles = getTrendingProfiles(users);

        for (const user of users) {
            const userFormation = user.formation;

            for (const chosenProfile of userFormation) {
                const trendingProfile = trendingProfiles.find(tp => tp.username === chosenProfile);
                if (trendingProfile && trendingProfile.points) {
                    user.points += trendingProfile.points;
                    await updateUser({ _id: user._id }, { $inc: { points: trendingProfile.points } }); // Increment the user's points
                    await user.save(); // Save updated points
                }
            }
        }

        io.emit('message', { message: 'Your points have been updated! Refresh the page to see your results!' });
        res.status(200).json({ success: true, message: 'Points updated and notifications sent!', user: user });
    } catch (err) {
        console.error('Error updating points: ', err);
        res.json({ success: false, message: 'Could not update points' });
    }
});


server.listen(PORT, () => {
    connectDB();
    console.log(`Server started on port ${PORT}`);
});

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "/client/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
    });
}

const sendVerificationEmail = async (email, verificationToken) => {
    email = 'mattiahag@gmail.com';
    const recipient = [{ email }];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Verify your email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category: "Email Verification",
        });

        console.log("Email sent successfully", response);
    } catch (error) {
        console.error(`Error sending verification`, error);
        throw new Error(`Error sending verification email: ${error}`);
    }
};

const sendPasswordResetEmail = async (email, resetURL) => {
    email = 'mattiahag@gmail.com';
    const recipient = [{ email }];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Reset your password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetLink}", resetURL),
            category: "Password Reset",
        });

        console.log("Password reset email sent successfully", response);
    } catch (error) {
        console.error(`Error sending password reset email`, error);
        throw new Error(`Error sending password reset email: ${error}`);
    }
};

const sendPasswordResetEmailSuccessfull = async (email) => {
    email = 'mattiahag@gmail.com';
    const recipient = [{ email }];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Password Reset Successful",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: "Password Reset Successful",
        });

        console.log("Password reset success email sent successfully", response);
    } catch (error) {
        console.error(`Error sending password reset success email`, error);
        throw new Error(`Error sending password reset success email: ${error}`);
    }
};