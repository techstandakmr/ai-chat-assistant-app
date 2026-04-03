import jwt from "jsonwebtoken";

export const generateToken = (payload, options = {}) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: options.expiresIn || "7d",
      algorithm: "HS256",
    }
  );
};
