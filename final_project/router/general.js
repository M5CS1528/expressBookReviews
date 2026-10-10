const express = require('express');
const books = require("./booksdb.js");
const { isValid, users } = require("./auth_users.js");

const public_users = express.Router();

// Register a new user.
public_users.post("/register", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }
  if (isValid(username)) {
    return res.status(409).json({ message: "User already exists." });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered. You can now log in." });
});

// Retrieve all books.
public_users.get("/", async (req, res) => {
  try {
    return res.status(200).json(books);
  } catch (error) {
    return res.status(500).json({ message: "Unable to retrieve books." });
  }
});

// Retrieve a book by the catalogue key used as its ISBN in this starter data.
public_users.get("/isbn/:isbn", async (req, res) => {
  try {
    const book = books[req.params.isbn];
    if (!book) return res.status(404).json({ message: "Book not found." });
    return res.status(200).json(book);
  } catch (error) {
    return res.status(500).json({ message: "Unable to retrieve the book." });
  }
});

// Search all books by author (case-insensitive, partial match).
public_users.get("/author/:author", async (req, res) => {
  try {
    const query = decodeURIComponent(req.params.author).toLowerCase();
    const matches = Object.entries(books)
      .filter(([, book]) => book.author.toLowerCase().includes(query))
      .reduce((result, [key, book]) => ({ ...result, [key]: book }), {});
    if (Object.keys(matches).length === 0) {
      return res.status(404).json({ message: "No books found for that author." });
    }
    return res.status(200).json(matches);
  } catch (error) {
    return res.status(500).json({ message: "Unable to search by author." });
  }
});

// Search all books by title (case-insensitive, partial match).
public_users.get("/title/:title", async (req, res) => {
  try {
    const query = decodeURIComponent(req.params.title).toLowerCase();
    const matches = Object.entries(books)
      .filter(([, book]) => book.title.toLowerCase().includes(query))
      .reduce((result, [key, book]) => ({ ...result, [key]: book }), {});
    if (Object.keys(matches).length === 0) {
      return res.status(404).json({ message: "No books found for that title." });
    }
    return res.status(200).json(matches);
  } catch (error) {
    return res.status(500).json({ message: "Unable to search by title." });
  }
});

// Retrieve a book's current reviews.
public_users.get("/review/:isbn", (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: "Book not found." });
  return res.status(200).json({ reviews: book.reviews || {} });
});

module.exports.general = public_users;
