const fs = require("fs");
const multer = require("multer");
const { ObjectId } = require("mongodb");
const songModel = require("../Model/songModel");

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => cb(null, file.originalname)
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // Limit file size to 50MB
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
        allowedMimeTypes.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only audio files are allowed'));
    }
});

async function createSong(req, res) {
    try {
        const { id, songTitle, songDescription } = req.body;

        if (!id || !songTitle || !songDescription) {
            return res.status(401).send({ message: "Missing required value(s)" });
        }

        const filePath = req.file.path;
        const songId = new ObjectId().toString();

        const songDocument = {
            songId,
            userId: id,
            title: songTitle,
            description: songDescription
        };

        await songModel.createSong(songDocument, filePath);
        fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting temporary file:", err);
        });

        return res.status(201).send({ message: "Song successfully created!" });
    } catch (error) {
        console.error("Error uploading song:", error);
        fs.unlink(req.file.path, (err) => {
            if (err) console.error("Error deleting temporary file:", err);
        });
        return res.status(500).send({ message: "Server Error" });
    }
}

async function getRandomSong(req, res) {
    try {
        const { randomSongId, bucket, songMetadata } = await songModel.getRandomSongMetadata();

        res.set({
            "Content-Type": "audio/mpeg",
            "Content-Disposition": `attachment; filename="song-${randomSongId}.mp3"`,
            "X-Song-Title": songMetadata.metadata.title,
            "X-Song-Description": songMetadata.metadata.description,
            "Access-Control-Expose-Headers": "X-Song-Title, X-Song-Description"
        });

        const stream = bucket.openDownloadStream(randomSongId);
        stream.pipe(res);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Server Error" });
    }
}

// Initialize function to set up routes
function initialize(app) {
    app.post("/api/songs/create", upload.single('selectedFile'), createSong);
    app.get("/api/songs/random", getRandomSong);
    console.log("Music API routes initialized");
}

module.exports = {
    initialize
};