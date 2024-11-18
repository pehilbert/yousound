const express = require("express");
const app = express();

app.get("/test", async (req, res) => {
    res.status(200).send("Hello from user profile service!");
});

app.listen(5000, () => {
    console.log("User profile service running on port 5000");
});