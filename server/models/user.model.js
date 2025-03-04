import mongoose from "mongoose";

// Define the User schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    points: { type: Number, default: 0 },
    formation: { type: [String], default: [] },
    myMalus: { type: [String], default: [] }, // I chose them
    pfp: { type: String, default: 'https://www.starksfamilyfh.com/image/9/original' },
    verificationToken: { type: String },
    expiresIn: { type: Date }
});
/**
 * User in DB
 */
export const User = mongoose.model('User', userSchema);