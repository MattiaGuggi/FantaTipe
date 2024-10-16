import mongoose from "mongoose";

// Define the User schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    points: { type: Number, default: 0 },
    formation: { type: [String], default: [] },
    pfp: { type: String, default: 'https://www.starksfamilyfh.com/image/9/original' },
    verificationToken: { type: String },
    expiresIn: { type: Date }
});

export const User = mongoose.model('User', userSchema);

// Helper function to get users from MongoDB
export async function getUsersFromDB() {
    return await User.find({});
}

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1); // Exit the process with failure (0 successfull, 1 failure)

    }
};

// Create a new user
export const createUser = async (newUser) => {
    const user = new User(newUser);
    await user.save();
};

// Find a user by email or username
export const findUser = async (criteria) => {
    return await User.findOne(criteria); // Ensure you're passing the correct criteria
};

// Update an existing user
export const updateUser = async (user) => {
    return await User.findByIdAndUpdate(user._id, user, { new: true }); // Update the user and return the updated document
};

// Updates every user's formation reference
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