const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Define your API routes here
app.get('/api', (req, res) => {
    res.json({ message: 'Test message from server' });
});

// For any other route, serve the React app
app.get('*', (req, res) => {
    res.sendFile(path.join(path.join(__dirname, '../frontend/build'), 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${port}`);
});
