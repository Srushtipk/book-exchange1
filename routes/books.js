import express from "express";
import Book from "../models/Book.js";

const router = express.Router();

/**
 * @route POST /books
 * @desc  Add a new book
 */
router.post("/", async (req, res) => {
  const { title, author, category, condition } = req.body;
  try {
    const book = await Book.create({
      user: req.userId,
      title,
      author,
      category,
      condition,
    });
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @route GET /books
 * @desc  Search / list books (public)
 */
router.get("/", async (req, res) => {
  const { title, author, category } = req.query;
  const filter = {};
  if (title) filter.title = new RegExp(title, "i");
  if (author) filter.author = new RegExp(author, "i");
  if (category) filter.category = category;

  try {
    const books = await Book.find(filter).populate("user", "username");
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
