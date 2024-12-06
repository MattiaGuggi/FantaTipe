import crypto from 'crypto';
import { findUser, createUser, updateUser, getUsersFromDB, updateFormations } from '../DB/database.js';
import { sendVerificationEmail, sendPasswordResetEmail, sendPasswordResetEmailSuccessfull } from '../utils/emailUtils.js';
import { getTrendingProfiles } from '../points/trendingProfiles.js';
import { getAllGames } from '../games/games.js';
import { Room } from '../models/room.model.js';
import { User } from '../models/user.model.js';
import { log } from 'console';

const MAX = 8;

export const login = async (req, res) => {
    const { email, password } = req.body;

    const user = await findUser({ email: email });

    if (!user) {
        return res.json({ success: false, message: 'User does not exist' });
    }

    if (user.password !== password) {
        return res.json({ success: false, message: 'Invalid password' });
    }

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
};

export const signup = async (req, res) => {
    const { email, password, username } = req.body;

    // Check for existing user
    const existingUser = await findUser({ email: email }); 
    const existingUsername = await findUser({ username: username });

    if (existingUser)
        return;
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
    req.session.user = newUser;
    // currentUser = newUser;
    await sendVerificationEmail(email, verificationToken);

    res.json({
        success: true,
        message: 'Sign up successful, user created',
        user: newUser
    });
};

export const verifyEmail = async (req, res) => {
    const { email, code } = req.body;
    let currentUser = req.session.user;

    try {
        if (!currentUser) { // Check if someone started creating a new user
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        if (currentUser.verificationToken != code) { // Check if the token matches
            return res.status(400).status({ success: false, message: 'Invalid verification code' });
        }
        
        const currentTime = new Date();
        if (currentTime > currentUser.expiresIn) { // Check if the token has expired 
            return res.status(400).json({ success: false, message: 'Token expired, user deleted' });
        }
        
        await createUser(currentUser); // Token is valid, create the user

        return res.json({ success: true, message: 'Email verified successfully, user created' });
    } catch (err) {
        console.error('Error verifying email', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await findUser({ email: email });

    if (user) {
        const resetToken = crypto.randomBytes(20).toString("hex");
        await sendPasswordResetEmail(email, `${API_URL}/auth/reset-password/${resetToken}?token=${resetToken}&email=${email}`);
        res.json({ success: true, message: "Password reset link sent to your email", token: resetToken });
    }
    else
        return res.json({ success: false, message: "User not found" });
};

export const getResetPassword = async (req, res) => {
    const { token } = req.params;
    const { email, newPassword } = req.body;

    const user = await  ({ email: email });

    if (user) {
        user.password = newPassword;
        await updateUser(user);
        await sendPasswordResetEmailSuccessfull(email);
        res.json({ success: true, message: 'Password reset successful', token });
    }
    else
        res.json({ success: false, message: 'User not found' });
};

export const postResetPassword = async (req, res) => {
    const { token } = req.params;
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email not provided' });
    }

    res.redirect(`${CLIENT_URL}/reset-password?token=${token}&email=${email}`);
};

export const search = async (req, res) => {
    const users = await getUsersFromDB();
    res.json(users);
};

export const profile = async (req, res) => {
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
};
/** 
 * Updates the user's profile
*/
export const updateProfile = async (req, res) => {
    const { email, username, password, pfp } = req.body;

    const user = await findUser({ email: email });

    if (user) {
        const oldUsername = user.username;

        user.username = username;
        user.password = password;
        user.pfp = pfp;

        await updateUser(user);
        
        await updateFormations(oldUsername, username);

        res.json({
            success: true,
            message: 'Profile and formations updated successfully',
            user,
        });
    }
    else
        res.status(404).json({ success: false, message: 'User not found' });
};

export const formation = async (req, res) => {
    const { email } = req.body;

    const user = await findUser({ email: email });

    if (user)
        res.json({ success: true, message: 'Formation found!', formation: user.formation });
    else
        res.json({ success: false, message: 'User not found' });
};

export const updateFormation = async (req, res) => {
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
};

export const getFormation = async (req, res) => {
    const username = req.params.username;

    const user = await findUser({ username: username });

    if (user) {
        res.json({ formation: user.formation || '' });
    }
    else
        return res.status(404).json({ message: 'User not found' });
};

export const getUsers = async (req, res) => {
    const users = await getUsersFromDB();
    res.json({ users });
};

export const updatePoints = async (req, res, io) => {
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
};

export const leaderboard = async (req, res) => {
    const users = await getUsersFromDB();
    const sortedUsers = users.sort((a, b) => b.points - a.points);
    
    res.json({ success: true, leaderboard: sortedUsers });
};

export const getGames = async (req, res) => {
    const games = await getAllGames();

    res.json({ success: true, message: 'Games found!', games: games || '' });
};

export const createRoom = async (req, res) => {
    const { creator, name, min, max } = req.body;

    if (!creator) return res.status(400).json({ error: 'Creator is required' });

    try {
        const creatorUser = await User.findOne({ username: creator });

        if (!creatorUser) return res.status(404).json({ error: 'User not found in the DB' });

        const generateRoomKey = () => Math.random().toString(36).substring(2, 10);
        const key = generateRoomKey();

        // creatorUser.username must be the same as the passed variable 'creator'
        const newRoom = new Room({
            key,
            name,
            min,
            max,
            creator: creatorUser.username,
        });

        await newRoom.save();

        res.status(201).json({ success: true, roomKey: key, message: 'Room created successfully' });

    } catch (error) {
        res.status(500).json({ error: 'Failed to create room', details: error.message });
    }
};

export const joinRoom = async (req, res) => {
    const { key, participant } = req.body;

    if (!key || !participant) return res.status(400).json({ error: 'Room key and participant are required' });
  
    try {
        const room = await Room.findOne({ key });
        if (!room) return res.status(404).json({ error: 'Room not found' });

        if (room.participants.length < room.max && !room.participants.includes(participant) && room.creator !== participant) {
            room.participants.push(participant);
            await room.save();
        }
  
        res.status(200).json({ success: true, message: 'Joined the room successfully', room });
    } catch (error) {
        res.status(500).json({ error: 'Failed to join room' });
    }
};

export const fetchRoomDetails = async (req, res) => {
    const { key } = req.params;
  
    try {
        const room = await Room.findOne({ key });
        if (!room) return res.status(404).json({ error: 'Room not found' });
  
        res.status(200).json({ success: true, room });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch room details' });
    }
};

export const deleteRoom = async (req, res) => {
    const { key } = req.params;

    try {
        const room = await Room.findOneAndDelete({ key });
        if (!room) return res.status(404).json({ error: 'Room not found' });


        res.status(200).json({ success: true, message: 'Room deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete room' });
    }
};