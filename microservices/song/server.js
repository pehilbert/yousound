const express = require('express');
const multer = require('multer');
const path = require('path');
const { ObjectId } = require('mongodb');
const fs = require('fs');
const { GridFSBucket } = require('mongodb');
const { MongoClient } = require('mongodb');
const dbUtil = require('./util/database-util.js'); // Adjust path as necessary
require('dotenv').config();

const app = express();
app.use(express.json());

// Initialize database
async function initializeDatabase() {
    const uri = process.env.DB_URI;
    const dbName = process.env.DB_NAME;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(dbName);
        const collection = db.collection('songs');

        // Example: Ensure indexes if necessary
        await collection.createIndex({ songId: 1 }, { unique: true });
        console.log('Index on "songId" created successfully');
    } catch (err) {
        console.error('Error initializing database:', err);
    } finally {
        await client.close();
        console.log('Database connection closed');
    }
}
initializeDatabase();

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

// Endpoints
/**
 * POST /api/songs/create
 * Creates a new song in the database.
 */
app.post('/api/songs/create', upload.single('selectedFile'), async (req, res) => {
    console.log('Received request to upload song');
    console.log(req.body);
    console.log(req.file);

    const { id, songTitle, songDescription } = req.body;
    const file = req.file;

    // Check if all required fields are present
    if (!id || !songTitle || !songDescription) {
        return res.status(400).send({ message: 'Missing required value(s)' });
    }

    const filePath = file.path;  // Path of the uploaded file
    const songId = new ObjectId().toString();  // Generate a new ObjectId for the song
    const songDocument = {
        songId,
        userId: id,
        title: songTitle,
        description: songDescription,
    };

    try {
        // Insert song document into the database
        await dbUtil.createMp3Document('songs', songDocument, filePath);
        console.log(`Song inserted with ID: ${songId}`);

        // Clean up temporary file after DB insert
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Error deleting temporary file:', err);
            } else {
                console.log('Temporary file deleted successfully');
            }
        });

        return res.status(201).send({ message: 'Song successfully created!' });
    } catch (error) {
        console.error('Error uploading song:', error);

        // Clean up temporary file if an error occurs
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Error deleting temporary file:', err);
            } else {
                console.log('Temporary file deleted after error');
            }
        });

        return res.status(500).send({ message: 'Server Error' });
    }
});

/**
 * GET /api/songs/random
 * Streams a random song to the client.
 */
app.get('/api/songs/random', async (req, res) => {
    try {
        const client = new MongoClient(process.env.DB_URI);
        await client.connect();
        const db = client.db('yousound');
        const bucket = new GridFSBucket(db, { bucketName: 'songs' });

        const songIds = await dbUtil.getAllSongIds();
        if (!songIds || songIds.length === 0) {
            return res.status(404).send({ message: 'No song IDs found' });
        }

        const randomIndex = Math.floor(Math.random() * songIds.length);
        const randomSongId = songIds[randomIndex];
        const songMetadata = await dbUtil.getSongMetadataById(randomSongId);

        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Disposition': `attachment; filename="song-${randomSongId}.mp3"`,
            'X-Song-Title': songMetadata.metadata.title,
            'X-Song-Description': songMetadata.metadata.description,
            'Access-Control-Expose-Headers': 'X-Song-Title, X-Song-Description',
        });

        const stream = bucket.openDownloadStream(randomSongId);
        stream.pipe(res);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Server Error' });
    }
});



// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Service running on port ${PORT}`);
});