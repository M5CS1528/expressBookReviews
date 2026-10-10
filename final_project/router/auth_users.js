const express = require("express");
const jwt = require("jsonwebtoken");
const books = require("./booksdb.js");

const regd_users = express.Router();
const users = [];
const JWT_SECRET = process.env.JWT_SECRET || "express-book-review-secret";

const isValid = (username) =>
  users.some((user) => user.username.toLowerCase() === String(username).toLowerCase());

const authenticatedUser = (username, password) =>
  users.some((user) => user.username === username && user.password === password);

// Only registered users can log in.
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password || !authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password." });
  }

  const accessToken = jwt.sign({ username }, JWT_SECRET, { expiresIn: "2h" });
  req.session.authorization = { accessToken, username };
  return res.status(200).json({ message: "Login successful.", token: accessToken });
});

// Add or update a review for a book. A user has one review per book.
regd_users.put("/auth/review/:isbn", (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: "Book not found." });

  const review = typeof req.body?.review === "string" ? req.body.review.trim() : "";
  if (!review) return res.status(400).json({ message: "A non-empty review is required." });

  const username = req.user?.username || req.session.authorization?.username;
  if (!username) return res.status(401).json({ message: "Unable to identify logged-in user." });

  book.reviews = book.reviews || {};
  book.reviews[username] = review;
  return res.status(200).json({ message: "Review added or updated successfully.", reviews: book.reviews });
});

// Delete the logged-in user's review from a book.
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: "Book not found." });

  const username = req.user?.username || req.session.authorization?.username;
  if (!username) return res.status(401).json({ message: "Unable to identify logged-in user." });

  book.reviews = book.reviews || {};
  if (!Object.prototype.hasOwnProperty.call(book.reviews, username)) {
    return res.status(404).json({ message: "No review found for this user and book." });
  }

  delete book.reviews[username];
  return res.status(200).json({ message: "Review deleted successfully.", reviews: book.reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.JWT_SECRET = JWT_SECRET;
