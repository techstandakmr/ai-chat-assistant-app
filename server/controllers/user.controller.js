import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from "dotenv";
dotenv.config();
// Initialize Cloudinary once at module level using env credentials
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const getProfile = async (req, res) => {
    try {
        // id comes from the decoded JWT set by auth middleware
        const { id } = req.userData;
        const user = await User.findById(id);
        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                joined: user?.createdAt,
                profilePicURL: user?.profilePicURL,
                publicId: user?.publicId
            }
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Failed to fetch profile" });
    }
};


// Reusable helper — validates and uploads a base64 image to Cloudinary
export const handleFile = async (fileBaseData) => {
    try {
        // Reject anything that isn't a base64 data URI
        if (!fileBaseData || !fileBaseData.includes("base64")) {
            return { err: "Invalid file format" };
        }
        // Rough size guard on the base64 string (~2MB decoded)
        if (fileBaseData.length > 2 * 1024 * 1024) {
            return { err: "File too large (max 2MB)" };
        }
        // Only allow images, not PDFs or other base64 types
        if (!fileBaseData.startsWith("data:image")) {
            return { err: "Only image files allowed" };
        }
        const uploadResult = await cloudinary.uploader.upload(
            fileBaseData,
            {
                folder: "ai_chat_assistant",
            }
        );
        return {
            success: true,
            fileURL: uploadResult.secure_url,
            publicId: uploadResult.public_id, // Stored so we can delete the image later
        };
    } catch (err) {
        return { err: "Upload failed" };
    }
};

export const updateUser = async (req, res) => {
    try {
        const { userID, name, email, password, oldPassword, updateByOTP, profilePic } = req.body;

        // Support lookup by either userID or email (covers OTP-based reset where only email is known)
        const user = await User.findOne({
            $or: [
                userID ? { _id: userID } : null,
                email ? { email } : null
            ].filter(Boolean)
        }).select("+password"); // password excluded by default in schema, needed here for comparison

        if (!user) return res.status(404).json({ message: "User not found" });

        // Prevent stealing another account's email
        if (email && email !== user.email) {
            const exists = await User.findOne({ email });
            if (exists) {
                return res.status(400).json({ message: "Email already in use" });
            }
            user.email = email;
        }

        if (name) user.name = name;

        if (profilePic) {
            // Remove old image from Cloudinary before uploading the new one to avoid orphaned files
            if (user.publicId) {
                await cloudinary.uploader.destroy(user.publicId);
            }
            const upload = await handleFile(profilePic);
            if (upload.err) {
                return res.status(400).json({ message: upload.err });
            }
            user.profilePicURL = upload.fileURL;
            user.publicId = upload.publicId;
        }

        if (password) {
            if (!updateByOTP) {
                // Standard password change — require current password as confirmation
                if (!oldPassword) {
                    return res.status(400).json({ message: "Old password required" });
                }
                const match = await bcrypt.compare(oldPassword, user.password);
                if (!match) {
                    return res.status(401).json({ message: "Incorrect old password" });
                }
            } else {
                // OTP-based reset — skip old password, but confirm OTP was verified first
                const otp = await OTPModel.findOne({ email: user?.email });
                if (!otp || otp?.code != "verified") {
                    return res.status(400).json({ message: "OTP not verified" });
                }
                // Clean up OTP records once the reset is approved
                await OTPModel.deleteMany({ email: user?.email });
            }
            const hashed = await bcrypt.hash(password, 10);
            user.password = hashed;
        }

        await user.save();
        res.json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                profilePicURL: user.profilePicURL
            }
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Update failed" });
    }
};

export const deleteAccount = async (req, res) => {
    try {
        const { password, userID } = req.body;

        const user = await User.findById(userID).select("+password");
        if (!user) return res.status(404).json({ message: "User not found" });

        // Require password confirmation before irreversible deletion
        if (!password) {
            return res.status(400).json({ message: "Password is required" });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        // Delete profile image from Cloudinary to avoid storage leaks
        if (user.publicId) {
            await cloudinary.uploader.destroy(user.publicId);
        }

        await User.findByIdAndDelete(userID);
        res.json({
            success: true,
            message: "Account deleted successfully"
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Delete account failed" });
    }
};