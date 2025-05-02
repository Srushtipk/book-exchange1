import express from "express";
import Request from "../models/Request.js";

const router = express.Router();

/**
 * @route POST /requests
 * @desc  Request a book
 */
router.post("/", async (req, res) => {
  const { bookId } = req.body;
  try {
    const exists = await Request.findOne({
      book: bookId,
      requester: req.userId,
    });
    if (exists) {
      return res.status(400).json({ error: "Already requested" });
    }
    const newReq = await Request.create({
      book: bookId,
      requester: req.userId,
    });
    res.status(201).json(newReq);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @route PATCH /requests/:id
 * @desc  Accept or decline a request (only book owner)
 */
router.patch("/:id", async (req, res) => {
  const { status } = req.body; // "accepted" or "declined"
  try {
    const reqDoc = await Request.findById(req.params.id).populate("book");
    if (!reqDoc) return res.status(404).json({ error: "Request not found" });
    if (reqDoc.book.user.toString() !== req.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }
    reqDoc.status = status;
    await reqDoc.save();
    res.json(reqDoc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
