const multer = require('multer');
const path = require('path');
const { ObjectId } = require('mongodb');
const fs = require('fs');
const dbUtil = require("../ports/database/database-util");

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: function(req, file, cb) {
        const allowedMimeTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only audio files are allowed'));
        }
    }
});

module.exports = {
    initialize : (app) => {

        /*
        Endpoint: POST /api/songs/create
        Description: Creates a new song for a user and responds with the song ID if successful
        */
        app.post("/api/songs/create", upload.single('selectedFile'), async (req, res) => {
            console.log('Received request to upload song');
            console.log('Body:', req.body);
            console.log('File:', req.file);

            if (!req.body.id || !req.body.songTitle || !req.body.songDescription) {
                console.log("Not all values provided in body: " + req.body);
                return res.status(401).send({ message: "Missing required value(s)" });
            }

            const filePath = req.file.path;
            const songId = new ObjectId().toString();

            const songDocument = {
                songId: songId,
                userId: req.body.id,
                title: req.body.songTitle,
                description: req.body.songDescription,
            };

            try {
                const insertedId = await dbUtil.createMp3Document('songs', songDocument, filePath);
                console.log(`Song inserted with ID: ${insertedId}`);
                fs.unlink(filePath, (err) => {
                    if (err) console.error('Error deleting temporary file:', err);
                    else console.log('Temporary file deleted successfully');
                });
            } catch (error) {
                console.error("Error uploading song:", error);
                fs.unlink(filePath, (err) => {
                    if (err) console.error('Error deleting temporary file:', err);
                    else console.log('Temporary file deleted successfully');
                });
            }

            return res.status(201).send({ message: "Song successfully created!" });
        });

        /*
        Endpoint: GET /api/songs/random
        Description: Retrieves a random song from all songs and streams it to the client
        */
        app.get("/api/songs/random", async (req, res) => {
            try {
                const songIds = await dbUtil.getAllSongIds();

                if (!songIds || songIds.length === 0) {
                    return res.status(404).send({ message: "No songs found" });
                }

                const randomIndex = Math.floor(Math.random() * songIds.length);
                const randomSong = songIds[randomIndex];
                const songMetadata = await dbUtil.getSongMetadataById(randomSong);

                res.set({
                    'Content-Type': 'audio/mpeg',
                    'Content-Disposition': `attachment; filename="song-${randomSong}.mp3"`,
                    'X-Song-Title': songMetadata.metadata.title,
                    'X-Song-Description': songMetadata.metadata.description,
                    'Access-Control-Expose-Headers': 'X-Song-Title, X-Song-Description',
                });

                const stream = await dbUtil.getSongDownloadStreamById(randomSong);
                stream.pipe(res);
            } catch (error) {
                console.error(error);
                return res.status(500).send({ message: "Server Error" });
            }
        });

        /*
        Endpoint: GET /api/songs/streamSongById
        Description: Will stream a song requested from the client        
        */
        app.get("/api/songs/streamSongById", async (req, res) => {
            console.log(req.body);

        });

        /*
        Endpoint: GET /api/songs/homepageUserSongs
        Description: Will get 10 songs for the user to be able to 
        select for the homepage
        */



        console.log("Songs API routes initialized");
    }
}

