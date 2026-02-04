const express = require('express');
const axios = require('axios')
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (username && password) {

    // Check if the user does not already exist
    if (!isValid(username)) {

      // Add the new user to the users array
      users.push({ "username": username, "password": password });
      console.log(users)
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }

  // Return error if username or password is missing
  return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
  try {
    const data = await Promise.resolve(books)


    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const isbn = req.params.isbn
    const data = await axios.get('http://localhost:5000/')
    const book = data.data[isbn]

    if (book) {
      return res.status(200).json({ book: book })
    }
    else
      return res.status(404).json({ message: "Book not found!" })
  }
  catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
});

// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
  try {
    author = req.params.author
    const data = await axios.get('http://localhost:5000/')
    const book = Object.values(data.data).filter((item) => item.author === author)

    if (book.length > 0) {
      return res.status(200).json({ book })
    }
    else
      return res.status(404).json({ message: "Book not found!" })
  }
  catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
});

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
  try {
    title = req.params.title
    const data = await axios.get('http://localhost:5000/')
    const book = Object.values(data.data).filter((item) => item.title === title)

    if (book.length > 0) {
      return res.status(200).json({ book })
    }
    else
      return res.status(404).json({ message: "Book not found!" })
  }
  catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
});

//  Get book review
public_users.get('/review/:isbn', async (req, res) => {
  try {
    isbn = req.params.isbn
    const data = await axios.get('http://localhost:5000/')
    const book = data.data[isbn]


    if (book) {
      return res.status(200).json(book.reviews)
    }
    else {
      return res.status(404).json({ message: "Book not found!" })
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
});

module.exports.general = public_users;
