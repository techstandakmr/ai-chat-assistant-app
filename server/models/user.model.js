import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        // Basic identity
        name: {
            type: String,
            required: true,
        },

        username: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        password: {
            type: String,
            required: true,
            minlength: 8,
        },

        // Profile image
        profilePicURL: {
            type: String,
            default: "",
        },

        publicId: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);
const User = mongoose.model("User", userSchema);
export default User;
