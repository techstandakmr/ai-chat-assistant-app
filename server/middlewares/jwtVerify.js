import jwt from "jsonwebtoken";

export const jwtVerify = (req, res, next) => {
  try {
    // Support cookie-based token (web) and Bearer header token (mobile/API clients)
    const tokenFromCookie = req.cookies?.chat_app_user_token;
    const authHeader = req.headers.authorization;
    const tokenFromHeader = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    // Cookie takes priority; header is the fallback
    const token = tokenFromCookie || tokenFromHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token missing",
      });
    }

    // Verifies signature and expiry — throws if either fails
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Attach user info to the request so downstream handlers don't need to re-query the DB
    req.userData = {
      id: decoded?.id,
      email: decoded?.email,
      username: decoded?.username,
      password: decoded?.password
    };

    next();
  } catch (error) {
    // Catches both invalid signature and token expiry from jwt.verify
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};