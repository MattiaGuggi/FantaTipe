// Example using MongoDB

const mongoose = require('mongoose');

// Define the User schema
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    points: Number,
    pfp: String,
});

const User = mongoose.model('User', userSchema);

// Helper function to get users from MongoDB
async function getUsersFromDB() {
    return await User.find({});
}

// Helper function to write (create/update) users in MongoDB
async function writeUserToDB(userData) {
    const user = new User(userData);
    await user.save();
    return user;
}
