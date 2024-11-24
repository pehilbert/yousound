const dbUtil = require("./util/database-util.js");
const { MongoClient } = require('mongodb');
const express = require("express");
const app = express();

app.use(express.json());

// Initialize database, particularly to set up index on username and email
async function initializeDatabase() {
    const uri = process.env.DB_URI;
    const dbName = process.env.DB_NAME;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Connected to MongoDB");

        const db = client.db(dbName);

        const collection = db.collection('users');

        // Create a unique index on the 'username' field
        await collection.createIndex({ username: 1 }, { unique: true });
        await collection.createIndex({ email: 1 }, { unique: true });
        console.log("Index on 'username' and 'email' created successfully");

    } catch (err) {
        console.error("Error initializing database:", err);
    } finally {
        await client.close();
        console.log("Connection closed");
    }
}

initializeDatabase();

app.get("/test", async (req, res) => {
    res.status(200).send("Hello from user profile service!");
});

app.listen(5000, () => {
    console.log("User profile service running on port 5000");
});

/*
Endpoint: POST /api/users
Description: Creates a new user in the database and responds with
the new user's ID if successful
Authentication: None

Expected request body: {
    username (required), 
    email (required)
}
Status codes and responses:
201 - Success 
    {message, id}
400 - Username or email already exists or not all values provided, or invalid email
    {message}
500 - Server Error
    {message}
*/
app.post("/api/users", async (req, res) => {
    console.log("Request to create user received.");

    if (!req.body.username || !req.body.email) {
        console.log("Not all values provided in body: " + req.body);
        return res.status(400).send({
            message : "Missing required value(s)"
        });
    }
        
    try {
        let result = await dbUtil.createDocument("users", req.body);
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
            } else if (error.keyPattern && error.keyPattern.email) {
                return res.status(400).send({
                    message : "Email already in use"
                });
            }
        }

        return res.status(500).send({
            message : "Server Error"
        });
    }
});

/*
Endpoint: GET /api/users:username
Description: Retrieves profile of user given by username
Info retrieved is just their username for now
Authentication: None

Expected request body: none
Status codes and responses:
200 - OK
    {message, userInfo}
404 - Not Found
    {message}
500 - Server Error
    {message}
*/
app.get("/api/users/:username", async (req, res) => {
    console.log("Profile read request received. ID = " + req.params.id);

    try {
        let result = await dbUtil.getDocument("users", {username : req.params.username});

        if (result) {
            console.log("Successfully retrieved profile for " + req.params.username + "\nID = " + userInfo._id.toString());
            return res.status(200).send({
                message : "User found",
                userInfo : result
            });
        } else {
            console.log("User not found: " + req.params.username);
            return res.status(404).send({
                message : "User not found"
            });
        }
    } catch (error) {
        console.error(error);

        return res.status(500).send({
            message : "Server Error"
        });
    }
});