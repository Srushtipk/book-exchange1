import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * @route POST /auth/signup
 * @desc  Create user & return a JWT (expires in 1 day)
 */
router.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({ username, password: hash });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });
    res.json({ token });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Username already taken" });
    }
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route POST /auth/login
 * @desc  Verify credentials & return a JWT (expires in 1 day)
 */
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
