import express from 'express';
import { 
    forgotPassword, 
    formation, 
    getFormation, 
    getResetPassword, 
    getUsers, 
    leaderboard, 
    login, 
    postResetPassword, 
    profile, 
    search, 
    signup, 
    updateFormation, 
    updatePoints, 
    updateProfile, 
    verifyEmail 
} from '../controller/authController.js';

const authRoutes = (io) => {
    const router = express.Router();

    router.post('/login', (req, res) => login(req, res)); 
    router.post('/signup', (req, res) => signup(req, res));
    router.post('/auth/verify-email', (req, res) => verifyEmail(req, res));
    router.post('/forgot-password', (req, res) => forgotPassword(req, res));
    router.post('/auth/reset-password/:token', (req, res) => postResetPassword(req, res));
    router.post('/update-profile', (req, res) => updateProfile(req, res));
    router.post('/formation', (req, res) => formation(req, res));
    router.post('/update-formation', (req, res) => updateFormation(req, res));
    router.post('/update-points', (req, res) => updatePoints(req, res, io));
    router.get('/auth/reset-password/:token', (req, res) => getResetPassword(req, res));
    router.get('/search', (req, res) => search(req, res));
    router.get('/profile/:username', (req, res) => profile(req, res));
    router.get('/get-formation/:username', (req, res) => getFormation(req, res));
    router.get('/get-users', (req, res) => getUsers(req, res));
    router.get('/leaderboard', (req, res) => leaderboard(req, res));

    return router;
};

export default authRoutes;
