const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Username and password are required." });
    }

    const userExists = users.some((user) => user.username === username);

    if (userExists) {
        return res.status(404).json({ message: "User already exists!" });
    }

    users.push({ "username": username, "password": password });
    return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        const getBooks = new Promise((resolve, reject) => {
            resolve(books);
        });

        const bookList = await getBooks;
        return res.status(200).send(JSON.stringify(bookList, null, 4));
    } catch (error) {
        return res.status(500).json({ message: "Error retrieving book list", error: error.message });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;

    try {
        const getBookByISBN = new Promise((resolve, reject) => {
            if (books[isbn]) {
                resolve(books[isbn]);
            } else {
                reject("Book not found");
            }
        });

        const book = await getBookByISBN;
        return res.status(200).json(book);
    } catch (error) {
        return res.status(404).json({ message: error });
    }
});
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;

    try {
        const getBooksByAuthor = new Promise((resolve, reject) => {
            const keys = Object.keys(books);
            let booksByAuthor = [];

            keys.forEach(key => {
                if (books[key].author.toLowerCase() === author.toLowerCase()) {
                    booksByAuthor.push(books[key]);
                }
            });

            if (booksByAuthor.length > 0) {
                resolve(booksByAuthor);
            } else {
                reject("No books found for this author");
            }
        });

        const matchingBooks = await getBooksByAuthor;
        return res.status(200).json(matchingBooks);
    } catch (error) {
        return res.status(404).json({ message: error });
    }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;

    try {
        const getBooksByTitle = new Promise((resolve, reject) => {
            const keys = Object.keys(books);
            let booksByTitle = [];

            keys.forEach(key => {
                if (books[key].title.toLowerCase() === title.toLowerCase()) {
                    booksByTitle.push(books[key]);
                }
            });

            if (booksByTitle.length > 0) {
                resolve(booksByTitle);
            } else {
                reject("No books found with this title");
            }
        });

        const matchingBooks = await getBooksByTitle;
        return res.status(200).json(matchingBooks);
    } catch (error) {
        return res.status(404).json({ message: error });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).json(books[isbn].reviews);
    }
    return res.status(404).json({ message: "Book not found" });
});

module.exports.general = public_users;
