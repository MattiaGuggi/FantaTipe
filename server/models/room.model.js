import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  creator: { type: String, required: true },
  participants: [{ type: String }], // Usernames or IDs
  status: { type: String, default: 'waiting' }, // e.g., 'waiting', 'active', 'ended'
}, { timestamps: true });

export const Room = mongoose.model('Room', roomSchema);