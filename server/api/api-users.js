const dbUtil = require("../database/database-util");
const bcrypt = require("bcrypt");
const path = require("path");
const multer = require('multer');
const express = require('express');
const { ObjectId } = require('mongodb');
const fs = require('fs');
const { GridFSBucket } = require('mongodb');
require("dotenv").config({ path: path.resolve(__dirname, '../.env') });
const {MongoClient} = require("mongodb");

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
      // Allow only certain mime types
      const allowedMimeTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(null, false);
        return cb(new Error('Only audio files are allowed'));
      }
    }
  });

const DB_URI = process.env.DB_URI;

module.exports = {
    initialize : (app) => {
        require("dotenv").config({ path: path.resolve(__dirname, '../.env') });
        const SALT_ROUNDS = process.env.SALT_ROUNDS;

        /*
        Endpoint: POST /api/users/create
        Description: Creates a new user in the database and responds with
        the new user's ID if successful
        Authentication: None

        Expected request body: {
            username (required), 
            password (required),
            email (required),
            other values are optional
        }
        Status codes and responses:
        201 - Success 
            {message, new_id}
        400 - Username or email already exists or not all values provided, or invalid email
            {message}
        500 - Server Error
            {message}
        */
        app.post("/api/users/create",upload.single('selectedFile'), async (req, res) => {
            if (!req.body.username || 
                !req.body.password || 
                !req.body.email) {
                    console.log("Not all values provided in body: " + req.body);
                    return res.status(400).send({
                        message : "Missing required value(s)"
                    });
                }
                

            try {
                let hashedPassword = await bcrypt.hash(req.body.password, parseInt(SALT_ROUNDS));

                let result = await dbUtil.createDocument("users", {
                    ...req.body,
                    password : hashedPassword
                });
                result = result.toString();

                console.log("User successfully created with ID " + result);

                return res.status(201).send({
                    message : "User successfully created!",
                    new_id : result
                });
            } catch (error) {
                console.error(error);

                if (error.code === 11000) {
                    // Handle duplicate key error
                    if (error.keyPattern && error.keyPattern.username) {
                        return res.status(400).send({
                            message : "Username already in use"
                        });
                    } else if (error.keyPattern && error.keyPattern.email) {
                        return res.status(400).send({
                            message : "Email already in use"
                        });
                    } else {
                        return res.status(500).send({
                            message : "Server Error"
                        });
                    }
                } else {
                    return res.status(500).send({
                        message : "Server Error"
                    });
                }
            }
        });

         /*
        Endpoint: GET /api/users/profile/:id
        Description: Retrieves non-sensitive info about a user given by 
        ID in parameters
        Info retrieved is just their username for now
        Authentication: None

        Expected request body: none
        Status codes and responses:
        200 - OK
            {message, userInfo}
        404 - Not Found
            {message}
        500 - Server Error
            {message}
        */
        app.get("/api/users/read/:id", async (req, res) => {
            try {
                let result = await dbUtil.getDocument("users", {_id : new ObjectId(req.params.id)}, 
                {
                    username : true
                });

                if (result) {
                    console.log("Successfully retrieved user info for " + result.username);
                    return res.status(200).send({
                        message : "User found",
                        userInfo : result
                    });
                } else {
                    console.log("User not found, ID: " + req.params.id);
                    return res.status(404).send({
                        message : "User not found"
                    });
                }
            } catch (error) {
                console.error(error);

                return res.status(500).send({
                    message : "Server Error"
                });
            }
        });

        /*
        Endpoint: POST /api/songs/create
        Description: Creates a new song for a user will respond with the song
        id if successfull
        Authentication: None

        Expected request body: {
            email, 
            userName,
            songTitle,
            songFile,
            other values are optional
        }
        Status codes and responses:
        201 - Success 
            {message, song_id}
        400 - Song name already exists
            {message}
        401 - Incorrect File ty
            {message}
        500 - Server Error
            {message}
        */
        app.post("/api/songs/create", upload.single('selectedFile'),async (req, res) => {
            console.log('Received request to upload song');
            console.log('Body:', req.body);
            console.log('File:', req.file);
            

            if (!req.body.id || 
                !req.body.songTitle || 
                !req.body.songDescription) 
            {
                console.log("Not all values provided in body: " + req.body);
                return res.status(401).send({
                        message : "Missing required value(s)"
                });
            }
            const filePath = req.file.path;

            const songId = new ObjectId().toString();

            // Create the song document
            const songDocument = {
                songId: songId, // You can use a generated songId or pass one
                userId: req.body.id,
                title: req.body.songTitle,
                description: req.body.songDescription, // Optional, defaults to an empty string
            };  

            try 
            {
                const insertedId = await dbUtil.createMp3Document('songs', songDocument,filePath);
                console.log(`Song inserted with ID: ${insertedId}`);
                // Clean up the temporary uploaded file
                fs.unlink(filePath, (err) => {
                    if (err) 
                    {
                    console.error('Error deleting temporary file:', err);
                    } 
                    else 
                    {
                    console.log('Temporary file deleted successfully');
                    }
                });

            } 
            catch (error) 
            {
                console.error("Error uploading song:", error);
                fs.unlink(filePath, (err) => {
                    if (err) 
                    {
                    console.error('Error deleting temporary file:', err);
                    } 
                    else 
                    {
                    console.log('Temporary file deleted successfully');
                    }
                });
            }

            console.log("working");

            return res.status(201).send({
                    message : "User successfully created!"
            });
        
        });

         /*
        Endpoint: GET /api/songs/random
        Description: Retrieves a random song from all songs
        and will stream that song to a client
        Authentication: None

        Expected request body: none
        Status codes and responses:
        200 - OK
            {message, userInfo}
        404 - Not Found
            {message}
        500 - Server Error
            {message}
        */
        app.get("/api/songs/random", async (req, res) => {
            try {

                // get all songs from a database call
                const client = await MongoClient.connect(DB_URI);
                const db = client.db('yousound');
                const songIds = await dbUtil.getAllSongIds(); 
                const bucket = new GridFSBucket(db, { bucketName: 'songs' });

                // check if there is more then one song
                if(!songIds || songIds.length == 0)
                {
                    return res.status(404).send({
                        message: "No songsIds found"
                    });
                }

                // get a random song from song lenth
                const randomIndex = Math.floor(Math.random() * songIds.length);
                const randomSong = songIds[randomIndex];

                // this is where I need to add song metadata
                const songMetadata = await dbUtil.getSongMetadataById(randomSong);
                //console.log(songMetadata.metadata);

                // set appripriate headers fror mp3 files
                res.set({
                    'Content-Type': 'audio/mpeg',
                    'Content-Disposition': `attachment; filename="song-${randomSong}.mp3"`,
                    'X-Song-Title': songMetadata.metadata.title,
                    'X-Song-Description': songMetadata.metadata.description,
                    'Access-Control-Expose-Headers': 'X-Song-Title, X-Song-Description',
                });

                // send song back
                const stream = bucket.openDownloadStream(randomSong);
                stream.pipe(res);

            } catch (error) {
                console.error(error);

                return res.status(500).send({
                    message : "Server Error"
                });
            }
        });
        
        console.log("Users API routes initialized");
    }
}