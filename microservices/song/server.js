const express = require("express");
const app = express();

app.use(express.json());

app.get("/test", async (req, res) => {
    res.status(200).send("Hello from song service!");
});

app.listen(5000, () => {
    console.log("Song service running on port 5000");
});