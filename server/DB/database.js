import mongoose from "mongoose";
import { User } from '../models/user.model.js';
/**
 * Helper function to get every user from MongoDB
 */
export const getUsersFromDB = async () => {
    return await User.find({});
}
/**
 * Connects to MongoDB
 */
export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1); // Exit the process with failure (0 successfull, 1 failure)
    }
};
/**
 * Finds user in DB based on email/username
 *
 * @param {newUser} newUser - User to create in DB
*/
export const createUser = async (newUser) => {
    const user = new User(newUser);
    await user.save();
};
/**
 * Finds user in DB based on email/username
 *
 * @param {criteria} criteria - The criteria(email/username)
 * @returns {User} User - A user saved in the DB
 */
export const findUser = async (criteria) => {
    return await User.findOne(criteria); // Ensure you're passing the correct criteria
};
/**
 * Updates an existing user
 *
 * @param {user} user - the user you need to update
 * @returns {void}
 */
export const updateUser = async (user) => {
    try  {
        await User.findByIdAndUpdate(user._id, { $set: user }, { new: true }); // Update the user and return the updated document
    } catch (err) {
        console.error('Error updating points', err);
    }
};
/**
 * Updates every users' formation reference from the oldUsername to the newUsername
 *
 * @param {oldUsername} oldUsername - the username you need to search for
 * @param {newUsername} newUsername - the username you need to replace with
 * @returns {void}
 */
export const updateFormations = async (oldUsername, newUsername) => {
    const users = await getUsersFromDB();  // Fetch all users

    // Iterate over all users
    for (const user of users) {
        let updated = false;

        // Iterate over each item in the user's formation
        for (let i=0 ; i<user.formation.length ; i++) {
            if (user.formation[i] === oldUsername) {
                user.formation[i] = newUsername; // Replace old username with the new one
                updated = true;
            }
        }
        
        if (updated) { // Save the user if their formation was updated
            await updateUser(user);  // Save updated user to the database
        }
    }
};