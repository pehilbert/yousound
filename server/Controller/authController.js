const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authModel = require("../Model/authModel");
const express = require("express");

require("dotenv").config();
const SECRET_KEY = process.env.JWT_SECRET_KEY;

// Login function remains unchanged
async function login(req, res) {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).send({ message: "Not all info provided" });
        }

        const user = await authModel.findUserByUsername(username);
        if (user && bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: "1h" });
            const stringID = user._id.toString();

            return res.status(200).send({ message: "Login successful!", token, id: stringID });
        } else {
            return res.status(401).send({ message: "Username or password was incorrect" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Server error" });
    }
}

// Initialize function to set up routes
function initialize(app) {
    // Set up the POST route for login
    app.post("/api/auth/login", login);
}

// Export the login function and initialize function
module.exports = { login, initialize };