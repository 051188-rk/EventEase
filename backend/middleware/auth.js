import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    console.log("🔹 Incoming auth check...");
    console.log("Cookies:", req.cookies);
    console.log("Authorization Header:", req.headers.authorization);

    let token;

    // 1️⃣ Get token from cookies or Bearer header
    if (req.cookies?.token) {
      console.log("✅ Found token in cookies");
      token = req.cookies.token;
    } else if (req.headers.authorization?.startsWith('Bearer ')) {
      console.log("✅ Found token in Authorization header");
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      console.warn("❌ No token found");
      return res.status(401).json({ error: 'Not authorized, no token' });
    }

    // 2️⃣ Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("✅ Decoded token:", decoded);
    } catch (err) {
      console.error("❌ Invalid token:", err.message);
      return res.status(401).json({ error: 'Not authorized, invalid token' });
    }

    // 3️⃣ Find user
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      console.warn("❌ Token valid but user not found in DB");
      return res.status(401).json({ error: 'Not authorized, user not found' });
    }

    // 4️⃣ Store only userId to keep route handling consistent
    req.user = { userId: user._id };
    console.log("✅ Authenticated user:", req.user);

    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    res.status(401).json({ error: 'Not authorized, token failed' });
  }
};

export default protect;
