const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

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
            res.status(500).send("An error occurred")
        });
});

app.get("/test/login", async (req, res) => {
    fetch(process.env.LOGIN_ENDPOINT + "/test")
        .then(response => response.text())
        .then(data => res.status(200).send(data))
        .catch(err => {
            console.error(err);
            res.status(500).send("An error occurred")
        });
});

app.get("/test/song", async (req, res) => {
    fetch(process.env.SONG_ENDPOINT + "/test")
        .then(response => response.text())
        .then(data => res.status(200).send(data))
        .catch(err => {
            console.error(err);
            res.status(500).send("An error occurred")
        });
});

// API
app.post("/api/auth/login", async (req, res) => {
    console.log("Login request received.");

    try {
        const response = await fetch(`${process.env.LOGIN_ENDPOINT}/api/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(req.body)
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
            // Note: this is a pretty bad rollback mechanism. We would probably want to use transactions instead
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

app.listen(5000, () => {
    console.log("API Gateway running on port 5000");
});