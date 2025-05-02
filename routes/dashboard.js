import express from "express";
import Book from "../models/Book.js";
import Request from "../models/Request.js";
import User from "../models/User.js";

const router = express.Router();

/**
 * @route GET /dashboard
 * @desc  Get user dashboard data + your username
 */
router.get("/", async (req, res) => {
  try {
    // 1) Fetch current user for their username
    const userDoc = await User.findById(req.userId).select("username");
    if (!userDoc) {
      return res.status(404).json({ error: "User not found" });
    }

    // 2) Books the user has listed
    const listedBooks = await Book.find({ user: req.userId });

    // 3) Requests *you* have sent—populate the book and your own requester info
    const yourRequests = await Request.find({ requester: req.userId })
      .populate("book")
      .populate("requester", "username"); // will be you

    // 4) All requests, but only keep those targeting *your* books
    const allReqs = await Request.find()
      .populate({
        path: "book",
        match: { user: req.userId },
      })
      .populate("requester", "username");

    const incomingRequests = allReqs.filter((r) => r.book);

    // 5) Return everything, including your username
    res.json({
      username: userDoc.username,
      listedBooks,
      yourRequests,
      incomingRequests,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
