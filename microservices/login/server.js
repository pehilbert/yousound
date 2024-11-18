const express = require("express");
const app = express();

app.get("/test", async (req, res) => {
    res.status(200).send("Hello from login service!");
});

app.listen(5000, () => {
    console.log("Login service running on port 5000");
});