const express = require("express");
const app = express();

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

app.listen(5000, () => {
    console.log("API Gateway running on port 5000");
});