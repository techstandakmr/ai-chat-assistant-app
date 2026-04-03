import OTPModel from "../models/otp.model.js";
import User from "../models/user.model.js";
import { sendEmail, otpEmailTemplate } from "../utils/sendEmail.js";
import { updateUser } from "./user.controller.js";

export const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        // Block OTP requests for unregistered emails early
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Email not registered" });
        }

        // 6-digit code + 10-minute expiry window
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        // Clear any previous OTPs for this email so only one is valid at a time
        await OTPModel.deleteMany({ email });

        // Save the new OTP before sending — email delivery is best-effort
        await OTPModel.create({ email, code, expiresAt });

        const html = otpEmailTemplate(user.name, code);
        const emailResult = await sendEmail(
            email,
            "Your OTP Verification Code",
            html
        );

        if (emailResult.success) {
            return res.json({
                success: true,
                message: "OTP sent successfully"
            });
        } else {
            return res.status(500).json({ message: "Failed to send OTP" });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Failed to send OTP" });
    }
};

export const verifyOTP = async (req, res) => {
    try {
        const { email, code } = req.body;

        // Match by both email and code — prevents guessing OTPs across accounts
        const otp = await OTPModel.findOne({ email, code });
        if (!otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // Expiry check is manual since MongoDB TTL deletion isn't instant
        if (otp.expiresAt < new Date()) {
            return res.status(400).json({ message: "OTP expired" });
        }

        // Mark as verified instead of deleting — the reset step checks for "verified" then cleans up
        await OTPModel.findByIdAndUpdate(
            otp._id,
            { code: "verified" }
        );

        res.json({
            success: true,
            message: "OTP verified successfully"
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "OTP verification failed" });
    }
};