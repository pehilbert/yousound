const dbUtil = require("../database/database-util");
const http = require('http');
const bcrypt = require("bcrypt");
const path = require("path");
const multer = require('multer');

// configure multer for files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Directory where files will be stored
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to file name
    }
});

const upload = multer({ storage: storage });

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
        app.post("/api/songs/create", async (req, res) => {
            if (!req.body.id || 
                !req.body.songTitle || 
                !req.body.songDescription) 
            {
                console.log("Not all values provided in body: " + req.body);
                return res.status(401).send({
                        message : "Missing required value(s)"
                });
            }

            const file = req.body.selectedFile;
            if (!file) 
            {
                console.log("402");
                return res.status(402).send({ message: "No file uploaded" });
            }
            else if(file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/mp3')
            {
                console.log("403");
                return res.status(403).send({ message: "Improperfile was uploaded" });
            }

            console.log("working");

            return res.status(201).send({
                    message : "User successfully created!"
            });
        
        });
        
        console.log("Users API routes initialized");
    }
}