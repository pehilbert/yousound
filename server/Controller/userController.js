const express = require("express");
const userModel = require("../Model/userModel");

async function createUser(req, res) {
    const { username, password, email } = req.body;
    const saltRounds = process.env.SALT_ROUNDS;

    if (!username || !password || !email) {
        console.log("Not all values provided in body: " + req.body);
        return res.status(400).send({ message: "Missing required value(s)" });
    }

    try {
        const newUserId = await userModel.createUser(req.body, saltRounds);
        console.log("User successfully created with ID " + newUserId);
        return res.status(201).send({ message: "User successfully created!", new_id: newUserId });
    } catch (error) {
        console.error(error);
        if (error.code === 11000) {
            const message = error.keyPattern?.username ? "Username already in use" : "Email already in use";
            return res.status(400).send({ message });
        } else {
            return res.status(500).send({ message: "Server Error" });
        }
    }
}

async function getUserProfile(req, res) {
    try {
        const user = await userModel.getUserById(req.params.id);
        if (user) {
            console.log("Successfully retrieved user info for " + user.username);
            return res.status(200).send({ message: "User found", userInfo: user });
        } else {
            console.log("User not found, ID: " + req.params.id);
            return res.status(404).send({ message: "User not found" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Server Error" });
    }
}

// Initialize function to set up routes
function initialize(app) {
    app.post("/api/users/create", createUser);
    app.get("/api/users/read/:id", getUserProfile);
}

module.exports = {
    initialize,
    createUser,
    getUserProfile
};