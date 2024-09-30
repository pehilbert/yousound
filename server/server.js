const express = require('express');
const path = require('path');
const app = express();
const port = 5000;
const api = require("./api/api-main");

app.use(express.json());

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Initialize API routes
api.initialize(app);

// For any other route, serve the React app
app.get('*', (req, res) => {
    res.sendFile(path.join(path.join(__dirname, '../frontend/build'), 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${port}`);
});
