const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
  {
    "username": "silu",
    "password": "1234"
  },
];

const isValid = (username) => {
  let userisvalid = users.filter((user) => { return user.username === username })

  if (userisvalid.length > 0)
    return true
  else
    return false
}

const authenticatedUser = (username, password) => {
  // Filter the users array for any user with the same username and password
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password);
  });
  // Return true if any valid user is found, otherwise false
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username or password is missing
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  // Authenticate user
  if (authenticatedUser(username, password)) {
    // Generate JWT access token
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    // Store access token and username in session
    req.session.authorization = {
      accessToken, username
    }
    console.log(users)
    return res.status(200).json({ message: "User successfully logged in" });
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;
  const review = req.body.review;

  if (!username) {
    return res.status(401).json({ message: "User not logged in" });
  }
  if (!review) {
    return res.status(400).json({ message: "Review text is required" });
  }

  // Ensure reviews object exists for this ISBN
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  // Check if user already has a review
  if (books[isbn].reviews[username]) {
    // Update existing review
    books[isbn].reviews[username] = review;
    console.log(books[isbn])
    return res.status(200).json({ message: "Review updated", user: username, review });
  } else {
    // Add new review
    books[isbn].reviews[username] = review;
    return res.status(200).json({ message: "Review added", user: username, review });
  }
});

// Delete book from review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const username = req.session.authorization?.username
  const isbn = req.params.isbn

  if (!books[isbn]) {
    return res.status(400).json({ message: "ISBN not found" })
  }

  if (!username) {
    return res.status(401).json({ message: "User not logged in" });
  }

  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review doesn't exist" })
  }

  const filteredReview = Object.fromEntries(Object.entries(books[isbn].reviews).filter(([user]) => user !== username))
  books[isbn].reviews = filteredReview
  console.log(books[isbn].reviews)
  return res.status(200).json({ message: "Review is deleted" })

});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
