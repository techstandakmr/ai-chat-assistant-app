import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { generateToken } from "../middlewares/generateToken.js";
import { validateEmail, validatePassword } from "../utils/validateInput.js";

export const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate required fields
        if (!name) {
            return res.status(400).json({ message: "Name is required" });
        }
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            return res.status(400).json({ message: emailValidation.error });
        }
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                message: passwordValidation.error,
            });
        }

        // Generate unique username from name (e.g. "John Doe" > "johndoe4271")
        const base = name.toLowerCase().replace(/[^a-z0-9]/g, "");
        const username = `${base}${Math.floor(Math.random() * 10000)}`;

        // Block signup if email or generated username is already taken
        const exists = await User.findOne({
            $or: [{ email }, { username }],
        });
        if (exists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password before storing (salt rounds = 10)
        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            username,
            email,
            password: hashed,
        });

        // Issue JWT for immediate authentication after signup
        const token = generateToken({
            id: user._id,
            email: user.email,
            username: user.username,
        });

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name,
                username,
                email,
                joined: user?.createdAt,
            },
        });
    } catch (e) {
        res.status(500).json({ message: "Register failed" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate inputs before hitting the database
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            return res.status(400).json({ message: emailValidation.error });
        }
        if (!password) {
            return res.status(400).json({ message: "Password is required" });
        }

        // Fetch user with password field (excluded by default in schema)
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Compare plain password against stored hash
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Issue JWT on successful login
        const token = generateToken({
            id: user._id,
            email: user.email,
            username: user.username,
        });

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                joined: user?.createdAt,
            },
        });
    } catch (e) {
        res.status(500).json({ message: "Login failed" });
    }
};