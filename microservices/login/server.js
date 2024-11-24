const dbUtil = require("./util/database-util.js");
const { MongoClient } = require('mongodb');
const express = require("express");
const bcrypt = require("bcrypt");
const app = express();

app.use(express.json());

// Initialize database, particularly to set up index on username
async function initializeDatabase() {
    const uri = process.env.DB_URI;
    const dbName = process.env.DB_NAME;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Connected to MongoDB");

        const db = client.db(dbName);

        const collection = db.collection('users');

        await collection.createIndex({ username: 1 }, { unique: true });
        console.log("Index on 'username' created successfully");

    } catch (err) {
        console.error("Error initializing database:", err);
    } finally {
        // Close the connection
        await client.close();
        console.log("Connection closed");
    }
}

initializeDatabase();

app.get("/test", async (req, res) => {
    res.status(200).send("Hello from login service!");
});

/*
Endpoint: POST /api/login
Description: Attempts to log a user in with the given credentials
and returns the user's ID
Authentication: None

Expected request body: {username, password}
Status codes and responses:
200 - OK 
    {message, id}
400 - Not all info provided
    {message}
401 - Incorrect credentials
    {message}
500 - Server error
    {message}
*/
app.post("/api/login", async (req, res) => {
    console.log("Login request received.");

    if (!req.body.username || !req.body.password) {
        console.log("Not all info provided for login attempt.");
        return res.status(400).send({message : "Not all info provided"});
    }

    try {
        let user = await dbUtil.getDocument("users", {username : req.body.username});
        
        if (user && user.password && bcrypt.compareSync(req.body.password, user.password)) {
            // let token = jwt.sign({id : user._id}, SECRET_KEY, {expiresIn : "1h"});
            let stringID = user._id.toString();
            console.log("Login attempt for " + req.body.username + " was successful. User ID: " + stringID);
            res.status(200).send({message : "Login successful!", id : stringID});
        } else {
            console.log("Login attempt for " + req.body.username + " failed.");
            res.status(401).send({message : "Username or password was incorrect"});
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({message : "Server error"});
    }
});

/*
Endpoint: POST /api/users
Description: Attempts to create a new user, and returns the new ID if successful
Authentication: None

Expected request body: {username, password}
Status codes and responses:
200 - OK 
    {message, id}
400 - Not all info provided
    {message}
500 - Server error
    {message}
*/
app.post("/api/users", async (req, res) => {
    console.log("User creation request received.");

    if (!req.body.username || !req.body.password) {
        console.log("Missing required values for user creation.");
        
        return res.status(400).send({
            message : "Missing required value(s)"
        });
    }

    try {
        let hashedPassword = await bcrypt.hash(req.body.password, parseInt(process.env.SALT_ROUNDS));

        let result = await dbUtil.createDocument("users", {
            username: req.body.username,
            password : hashedPassword
        });
        result = result.toString();
        console.log("User successfully created with ID " + result);

        return res.status(201).send({
            message : "User successfully created!",
            id : result
        });
    } catch (error) {
        console.error(error);

        if (error.code === 11000) {
            // Handle duplicate key error
            if (error.keyPattern && error.keyPattern.username) {
                return res.status(400).send({
                    message : "Username already in use"
                });
            }
        }

        return res.status(500).send({
            message : "Server Error"
        });
    }
});

app.delete("/api/users", async (req, res) => {
    console.log("Request to delete user received.");

    if (!req.body.username) {
        console.log("Not all required values provided.");
        return res.status(400).send({message: "Not all required values provided."});
    }

    try {
        let result = dbUtil.deleteDocument("users", {username : req.body.username});
        res.status(200).send({message : "Successfully deleted " + req.body.username, resultObject : result});
    } catch (error) {
        console.error(error);
        res.status(500).send({message : "Server error"});
    }
});

app.listen(5000, () => {
    console.log("Login service running on port 5000");
});