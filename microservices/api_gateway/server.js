const express = require("express");
const multer = require("multer");
const formData = require("form-data");
const fs = require("fs");
const fetch = require("node-fetch");
const path = require("path");
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');

app.use(express.json());
app.use(cors());

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(null, false);
            cb(new Error('Only audio files are allowed'));
        }
    },
});

// Test routes
app.get("/test", async (req, res) => {
    res.status(200).send("Hello from the API Gateway!");
});

app.get("/test/user_profile", async (req, res) => {
    fetch(process.env.USER_PROFILE_ENDPOINT + "/test")
        .then(response => response.text())
        .then(data => res.status(200).send(data))
        .catch(err => {
            console.error(err);
            res.status(500).send("An error occurred");
        });
});

app.get("/test/login", async (req, res) => {
    fetch(process.env.LOGIN_ENDPOINT + "/test")
        .then(response => response.text())
        .then(data => res.status(200).send(data))
        .catch(err => {
            console.error(err);
            res.status(500).send("An error occurred");
        });
});

app.get("/test/song", async (req, res) => {
    fetch(process.env.SONG_ENDPOINT + "/test")
        .then(response => response.text())
        .then(data => res.status(200).send(data))
        .catch(err => {
            console.error(err);
            res.status(500).send("An error occurred");
        });
});

// API
app.post("/api/auth/login", async (req, res) => {
    console.log("Login request received.");

    try {
        const response = await fetch(`${process.env.LOGIN_ENDPOINT}/api/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(req.body),
        });

        const data = await response.json();
        console.log("Data from server:", data);

        if (response.ok) {
            console.log("Login OK. Sending token.");
            const token = jwt.sign({ id: data.id }, process.env.SECRET_KEY, { expiresIn: "1h" });
            const stringID = data.id.toString();
            return res.status(200).send({ message: data.message, token, id: stringID });
        }

        console.log("Login failed.");
        res.status(response.status).send(data);
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).send({ message: "Server error" });
    }
});

app.post("/api/users/create", async (req, res) => {
    console.log("User creation request received.");

    try {
        const { username, password, email } = req.body;

        if (!username || !password || !email) {
            console.log("Not all required data provided.");
            return res.status(400).send({ message: "Not all required values provided." });
        }

        const loginRequestBody = { username, password };
        const profileRequestBody = { username, email };

        const loginResponse = await fetch(`${process.env.LOGIN_ENDPOINT}/api/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loginRequestBody),
        });

        if (!loginResponse.ok) {
            console.log("Login service failed.");
            const loginResponseData = await loginResponse.json();
            return res.status(loginResponse.status).send(loginResponseData);
        }

        console.log("Login service successful.");

        const profileResponse = await fetch(`${process.env.USER_PROFILE_ENDPOINT}/api/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(profileRequestBody),
        });

        if (!profileResponse.ok) {
            console.log("Profile service failed.");
            console.log("Rolling back login service...");

            const rollbackResponse = await fetch(`${process.env.LOGIN_ENDPOINT}/api/users`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username }),
            });

            if (!rollbackResponse.ok) {
                console.error("Rollback failed. System may be in an inconsistent state.");
                const rollbackError = await rollbackResponse.json();
                return res.status(500).send({
                    message: "User profile creation failed. Rollback also failed.",
                    rollbackError,
                });
            }

            console.log("Rollback successful.");
            const profileResponseData = await profileResponse.json();
            return res.status(profileResponse.status).send(profileResponseData);
        }

        console.log("Profile service successful.");
        console.log("Both services successful.");
        return res.status(201).send({ message: "User successfully created!" });
    } catch (err) {
        console.error("Error during user creation:", err);
        return res.status(500).send({ message: "Server error" });
    }
});

// Song API routes
app.post("/api/songs/create", upload.single('selectedFile'), async (req, res) => {
    console.log("Received song data:", req.body);
    console.log("Received file:", req.file);

    // Check for necessary fields in the body and file
    if (!req.body.songTitle || !req.body.songDescription || !req.file) {
        return res.status(400).send({ message: "Missing required fields or file" });
    }

    try {
        // Prepare the FormData for forwarding to the Song service
        const form = new formData();
        form.append('id', req.body.id);
        form.append('songTitle', req.body.songTitle);
        form.append('songDescription', req.body.songDescription);
        form.append('selectedFile', fs.createReadStream(req.file.path));

        const songResponse = await fetch(`${process.env.SONG_ENDPOINT}/api/songs/create`, {
            method: "POST",
            body: form,
            headers: form.getHeaders(),
        });

        const songData = await songResponse.json();

        // Handle response from the song service
        if (songResponse.ok) {
            res.status(201).send(songData);
        } else {
            res.status(songResponse.status).send(songData);
        }

        // Cleanup uploaded file after forward
        fs.unlink(req.file.path, (err) => {
            if (err) console.error('Error deleting temporary file:', err);
        });

    } catch (err) {
        console.error("Error creating song:", err);
        res.status(500).send({ message: "Server error while creating song" });
    }
});

app.get("/api/songs/random", async (req, res) => {
    console.log("Song endpoint:", process.env.SONG_ENDPOINT);
    try {
        const response = await fetch(`${process.env.SONG_ENDPOINT}/api/songs/random`);

        console.log(response.headers);

        if (response.ok) {
            res.set({
                "Content-Type": response.headers.get("content-type"),
                "Content-Disposition": response.headers.get("content-disposition"),
                "X-Song-Title": response.headers.get("x-song-title"),
                "X-Song-Description": response.headers.get("x-song-description"),
                "Access-Control-Expose-Headers": "X-Song-Title, X-Song-Description",
            });

            response.body.pipe(res);
        } else {
            const data = await response.json();
            res.status(response.status).send(data);
        }
    } catch (err) {
        console.error("Error retrieving random song:", err);
        res.status(500).send({ message: "Server error while retrieving song" });
    }
});

app.listen(5000, () => {
    console.log("API Gateway running on port 5000");
});