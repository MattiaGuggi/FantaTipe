import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import crypto from 'crypto';
import {
	PASSWORD_RESET_REQUEST_TEMPLATE,
	PASSWORD_RESET_SUCCESS_TEMPLATE,
	VERIFICATION_EMAIL_TEMPLATE,
} from "./mailtrap/emailTemplates.js";
import { mailtrapClient, sender } from "./mailtrap/mailtrap.config.js";
import { getTopProfilesByPoints, getTrendingProfiles } from './points/trendingProfiles.js';

const PORT = process.env.PORT;
const CLIENT_URL = process.env.CLIENT_URL;
const API_URL = process.env.NODE_ENV === "development" ? "http://localhost:8080" : "";
const corsOptions = {
    origin: [CLIENT_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
const __dirname = path.resolve();
const usersFilePath = path.join(__dirname, '/server/users.json'); // Path to the file that stores users

dotenv.config();

// Use the livereload middleware
const app = express();
app.use(express.json());
app.use(cors(corsOptions));
app.use(bodyParser.json());

app.options('*', cors({
    origin: CLIENT_URL,
    credentials: true
}));

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "/client/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
    });
}

let verificationCodes = {};
const MAX = 7;

// Helper function to read users from the JSON file
function readUsersFromFile() {
    if (!fs.existsSync(usersFilePath)) {
        return [];
    }
    const data = fs.readFileSync(usersFilePath, 'utf-8');
    return JSON.parse(data);
}

// Helper function to write users to the JSON file
function writeUsersToFile(users) {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
}

// Updates every users' points
async function updatePoints() {
    const users = readUsersFromFile(); // Read users from file
    const trendingProfiles = getTrendingProfiles(users); // Returns array with objects corresponding to all users' usernames and relative points

    users.forEach(user => { // Visits every single profile
        const userFormation = user.formation; // Gets array of formation for a user (username reference)

        userFormation.forEach(chosenProfile => { // Visits every choson profile in each users' formation
            trendingProfiles.forEach(trendingProfile => { // Visits every trending profile
                if (chosenProfile === trendingProfile.username && trendingProfile.points) { // Compares the formation to a trending profile
                    user.points += trendingProfile.points; // Updates user's points by adding the new points
                }
            });
        });
    });

    writeUsersToFile(users); // Save updated users to the file
}

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const users = readUsersFromFile();

    const user = users.find(user => user.email === email);

    if (user) { // If user exists, validate the password
        if (user.password === password) {
            res.json({
                success: true,
                message: 'Login successful',
                user: {
                    email: user.email,
                    password: user.password,
                    username: user.username,
                    points: user.points,
                    pfp: user.pfp
                }
            });
        }
        else {
            res.json({ success: false, message: 'Invalid password' });
        }
    }
    else {
      res.json({ success: false, message: 'User does not exist' });
    }
}); 

app.post('/signup', async (req, res) => {
    const { email, password, username } = req.body;
    let users = readUsersFromFile();

    let existingUserByEmail = users.find(user => user.email === email);
    let existingUserByUsername = users.find(user => user.username === username);
  
    if (existingUserByEmail)
        return res.json({ success: false, message: 'Email already in use' });
    if (existingUserByUsername)
        return res.json({ success: false, message: 'Username already in use' });
    else {
        const newUser = {
            email: email,
            password: password,
            username: username,
            points: 0,
            formation: [],
            pfp: 'https://www.starksfamilyfh.com/image/9/original'
        };
		const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        verificationCodes[email] = verificationToken;

        users.push(newUser);
        writeUsersToFile(users);
        await sendVerificationEmail(email, verificationToken); // Send email

        res.json({
            success: true,
            message: 'Sign up successful, user created',
            user: {
                email: newUser.email,
                password: newUser.password,
                username: newUser.username,
                points: newUser.points,
                formation: newUser.formation,
                pfp: newUser.pfp
            }
        });
    }
});

app.post('/auth/verify-email', (req, res) => {
    const { email, code } = req.body;

    if (verificationCodes[email] === code) {
        delete verificationCodes[email]; // Clean up the code after verification
        res.json({ success: true, message: 'Verification successful' });
    }
    else {
        console.log('Invalid verification code');
        res.json({ success: false, message: 'Invalid verification code' });
    }
});

app.post('/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    let users = readUsersFromFile();
    const user = users.find(user => user.email === email);

    if (user) {
        const resetToken = crypto.randomBytes(20).toString("hex"); // Generate reset token
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour
        
        await sendPasswordResetEmail(email, `${API_URL}/auth/reset-password/${resetToken}?token=${resetToken}&email=${email}`); // Send email with reset token link
        
        res.json({ success: true, message: "Password reset link sent to your email", token: resetToken }); // Return the token and success response
    } else {
        return res.json({ success: false, message: "User not found" });
    }
});

app.post('/auth/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { email, newPassword } = req.body;

    let users = readUsersFromFile();
    let userIndex = users.findIndex(user => user.email === email);

    if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        writeUsersToFile(users);
        await sendPasswordResetEmailSuccessfull(email);
        res.json({ success: true, message: 'Password reset successful', token: token });
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

app.get('/search', (req, res) => {
    const users = readUsersFromFile();
    res.json(users);
});

app.get('/profile/:username', (req, res) => {
    const { username } = req.params;
    const users = readUsersFromFile(); // Read users from file

    const user = users.find(user => user.username.toLowerCase() === username.toLowerCase());

    if (user) {
        res.json({
            success: true,
            user: {
                email: user.email,
                username: user.username,
                points: user.points,
                pfp: user.pfp
            }
        });
    }
    else {
        res.status(404).json({ success: false, message: 'User not found' });
    }
});

app.post('/update-profile', async (req, res) => {
    // Call this function every week
    // await updatePoints();
    const { email, username, password, pfp } = req.body;
    let users = readUsersFromFile();
  
    const userIndex = users.findIndex(user => user.email === email); // Find the user by their email
  
    if (userIndex !== -1) { // Update the user's details
        const oldUsername = users[userIndex].username; // Get the old username before updating

        // Update the user's details
        users[userIndex] = {
            ...users[userIndex],
            username,
            password,
            pfp
        };

        // Update other users' formations where the old username exists
        users.forEach(user => {
            if (user?.formation.includes(oldUsername)) {
                user.formation = user.formation.map(name => 
                    name === oldUsername ? username : name
                );
            }
        });
  
        writeUsersToFile(users);
    
        res.json({
            success: true,
            message: 'Profile and formations updated successfully',
            user: users[userIndex],
        });
    }
    else {
        res.status(404).json({ success: false, message: 'User not found' });
    }
});

app.post('/formation', (req, res) => {
    const { email } = req.body;
    let users = readUsersFromFile();

    const user = users.find(user => user.email === email);

    if (user) {
        res.json({ success: true, message: 'Formation found!', formation: user.formation });
    } else {
        res.json({ success: false, message: 'User not found' });
    }
});

app.post('/update-formation', (req, res) => {
    const { email, formation } = req.body;
    let users = readUsersFromFile();

    const user = users.find(user => user.email === email);
    if (user) {
        if (formation.length > MAX) {
            return res.json({
                success: false,
                message: 'Formation cannot exceed ' + MAX +' items'
            });
        }

        user.formation = formation;
        writeUsersToFile(users);
        res.json({ success: true, user });
    }
    else {
        res.json({ success: false, message: 'User not found' });
    }
});

app.get('/get-formation/:username', (req, res) => {
    const username = req.params.username;

    // Read the users.json file
    fs.readFile(usersFilePath, 'utf-8', (err, data) => {
        if (err)
            return res.status(500).json({ message: 'Error reading file' });

        const users = JSON.parse(data);
        const user = users.find(user => user.username === username);

        if (!user)
            return res.status(404).json({ message: 'User not found' });

        res.json({ formation: user.formation || '' });
    });
});

app.get('/get-users', (req, res) => {
    const users = readUsersFromFile();
    
    res.json({ users: users});
});
  
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

const sendVerificationEmail = async (email, verificationToken) => {
    email = 'mattiahag@gmail.com'; // Delete when adding domain to mailtrap
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
    email = 'mattiahag@gmail.com'; // Delete when adding domain to mailtrap
	const recipient = [{ email }];

	try {
		const response = await mailtrapClient.send({
			from: sender,
			to: recipient,
			subject: "Reset your password",
			html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
			category: "Password Reset",
		});

		console.log("Email sent successfully", response);
	} catch (error) {
		console.error(`Error sending password reset email`, error);
		throw new Error(`Error sending password reset email: ${error}`);
	}
};

const sendPasswordResetEmailSuccessfull = async (email) => {
    email = 'mattiahag@gmail.com'; // Delete when adding domain to mailtrap
    const recipient = [{email}];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Successfully reset password",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: "Password Successfully Reset"
        });

        console.log('Email sent successfully', response);
    } catch (error) {
        console.error('Error sending password reset successfull email', error);
        throw new Error();
    }
}