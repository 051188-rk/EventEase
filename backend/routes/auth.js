import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import { sendWelcomeEmail } from "../utils/sendEmail.js";
import { uploadImage } from "../utils/uploadImage.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Helper: set auth cookie
const setAuthCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

// Helper: create unique username (tries a few times)
const createUniqueUsername = async (base) => {
  let username = base.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase().slice(0, 20);
  let exists = await User.findOne({ username });
  let attempts = 0;
  while (exists && attempts < 10) {
    const suffix = Math.random().toString(36).substr(2, 5);
    username = `${base.slice(0, 12)}${suffix}`.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase().slice(0, 20);
    exists = await User.findOne({ username });
    attempts++;
  }
  // if still exists, append timestamp (very unlikely)
  if (exists) username = `${username}${Date.now().toString().slice(-4)}`;
  return username;
};

// ---------- Register ----------
router.post("/register", async (req, res) => {
  try {
    const { name = '', username = '', email = '', password, phone } = req.body;

    // basic validation
    if (!name.trim() || !username.trim() || !email.trim() || !password) {
      return res.status(400).json({ error: "Name, username, email and password are required" });
    }

    // normalize
    const normEmail = email.trim().toLowerCase();
    const normUsername = username.trim();

    // Check if user already exists (email or username)
    const existingUser = await User.findOne({
      $or: [{ email: normEmail }, { username: normUsername }]
    });

    if (existingUser) {
      return res.status(400).json({
        error: existingUser.email === normEmail 
          ? "Email already registered" 
          : "Username already taken"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      name: name.trim(),
      username: normUsername,
      email: normEmail,
      password: hashedPassword,
      phone: phone || null
    });

    await user.save();

    // Generate token & set cookie
    const token = generateToken(user._id);
    setAuthCookie(res, token);

    // Send welcome email (non-blocking)
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// ---------- Login ----------
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be email or username
    if (!identifier || !password) return res.status(400).json({ error: "Credentials required" });

    // try both email (lowercased) and username
    const query = {
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier }
      ]
    };
    const user = await User.findOne(query);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!user.password) {
      return res.status(401).json({ error: "Please use Google login for this account" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user._id);
    setAuthCookie(res, token);

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: "Login failed" });
  }
});

// ---------- Google Login ----------
router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: "No credential provided" });

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    if (!email) return res.status(400).json({ error: "Google account has no email" });

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // generate a safe base username and ensure uniqueness
      const base = (email.split('@')[0] || name || 'user').replace(/[^a-zA-Z0-9_]/g, '');
      const username = await createUniqueUsername(base);

      user = new User({
        name: (name || '').trim(),
        username,
        email: email.toLowerCase(),
        profilePic: picture || undefined,
        googleId
      });

      await user.save();

      // welcome email
      try {
        await sendWelcomeEmail(user.email, user.name);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }
    } else {
      // update googleId and profilePic if missing
      user.googleId = googleId;
      if (!user.profilePic && picture) user.profilePic = picture;
      await user.save();
    }

    const token = generateToken(user._id);
    setAuthCookie(res, token);

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: "Google login failed" });
  }
});

// ---------- Update Profile (Protected) ----------


router.put("/profile", authMiddleware, async (req, res) => {
  try {
    // Expect authMiddleware to set req.user.userId
    const userId = req.user?.userId;
    console.log("🔹 Profile update request received for:", userId, "Body:", req.body);

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { name, username, email, phone } = req.body || {};

    // Fetch user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Build uniqueness check only if username or email is changing
    const conflictQuery = { $or: [] };
    if (email && email.trim()) {
      conflictQuery.$or.push({
        email: email.trim().toLowerCase(),
        _id: { $ne: userId }
      });
    }
    if (username && username.trim()) {
      conflictQuery.$or.push({
        username: username.trim(),
        _id: { $ne: userId }
      });
    }

    if (conflictQuery.$or.length > 0) {
      const existingUser = await User.findOne(conflictQuery);
      if (existingUser) {
        return res.status(400).json({
          error: existingUser.email?.toLowerCase() === email?.trim().toLowerCase()
            ? "Email already registered"
            : "Username already taken"
        });
      }
    }

    // Apply safe updates (only when provided)
    if (typeof name === "string" && name.trim()) user.name = name.trim();
    if (typeof username === "string" && username.trim()) user.username = username.trim();
    if (typeof email === "string" && email.trim()) user.email = email.trim().toLowerCase();
    if (typeof phone !== "undefined") user.phone = phone || null;

    await user.save();

    console.log("✅ Profile updated for:", userId);

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error("❌ Profile update error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Profile update failed" });
  }
});


// ---------- Update Profile Picture (Protected) ----------
// Update Profile Picture (Protected Route)
router.put("/profile-picture", authMiddleware, uploadImage.single('profilePic'), async (req, res) => {
  try {
    const userId = req.user.userId; // ✅ match /profile route
    console.log('Profile picture upload: userId =', userId);

    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update profile picture
    user.profilePic = req.file.path;
    await user.save();

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Profile picture update error:', error);
    res.status(500).json({ error: "Profile picture update failed" });
  }
});


// ---------- Get current user ----------
router.get("/me", async (req, res) => {
  try {
    // Accept token from cookie or Authorization header
    const token = req.cookies?.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    if (!token) return res.status(401).json({ error: "No token, not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return res.status(401).json({ error: "User not found" });

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ error: "Invalid token" });
  }
});

// ---------- Logout ----------
router.post("/logout", (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: "Logged out successfully" });
});

export default router;
