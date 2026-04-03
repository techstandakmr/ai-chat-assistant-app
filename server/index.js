import express from "express";
import mongodbConnect from "./config/config.js";
import * as dotenv from "dotenv";
import routes from "./routes/routes.js";
import cors from "cors";
import cookieParser from "cookie-parser";
dotenv.config(); 
const app = express();
const corsOptions = {
    origin: "*",  
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: false 
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use("/api", routes);

const startServer = async () => {
    try {
        mongodbConnect();
        const PORT = 5000;
        const server = app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server started on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
    }
}
startServer();
