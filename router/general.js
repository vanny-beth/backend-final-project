const axios = require('axios');
const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    // Validate input
    if (!username && !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }
  
    if (!username) {
      return res.status(400).json({ message: "Username is required." });
    }
  
    if (!password) {
      return res.status(400).json({ message: "Password is required." });
    }
  
    // Check if user already exists
    const userExists = users.some(user => user.username === username);
    if (userExists) {
      return res.status(409).json({ message: "Username already exists." });
    }
  
    // Register user
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully." });
  });
  

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
      const response = await axios.get('http://localhost:5000/');
      res.send(JSON.stringify(books, null, 4)); // books is already available locally
    } catch (err) {
      res.status(500).json({ message: "Error fetching books", error: err.message });
    }
  });
  

// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;
  
    new Promise((resolve, reject) => {
      const book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject("Book not found");
      }
    })
      .then(data => res.status(200).send(data))
      .catch(err => res.status(404).json({ message: err }));
  });
  
  
// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author;
  
    try {
      const results = Object.values(books).filter(book => book.author === author);
      if (results.length > 0) {
        res.status(200).json(results);
      } else {
        res.status(404).json({ message: "Author not found" });
      }
    } catch (err) {
      res.status(500).json({ message: "Error", error: err.message });
    }
  });
  

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
    const title = req.params.title;
  
    new Promise((resolve, reject) => {
      const results = Object.entries(books).filter(([isbn, book]) =>
        book.title.toLowerCase() === title.toLowerCase()
      );
  
      if (results.length > 0) {
        resolve(results.map(([isbn, book]) => ({ isbn, ...book })));
      } else {
        reject("Title not found");
      }
    })
      .then(result => res.send(JSON.stringify(result, null, 4)))
      .catch(err => res.status(404).json({ message: err }));
  });  
  

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
  
    if (books[isbn]) {
      res.send(books[isbn].reviews);
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  });
  

module.exports.general = public_users;
