const dbUtil = require("./database-util");
const { MongoClient, GridFSBucket, ObjectId } = require('mongodb');
const fs = require('fs');

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, '../../.env') });
const DB_URI = process.env.DB_URI;
const DB_NAME = process.env.DB_NAME;

module.exports = {
    /*
    Creates a document in a collection given an object with values, returns the
    inserted ID, or throws an error if unable to insert.
    Also uploads an MP3 file to GridFS.
    */
    createMp3Document: async (collectionName, toInsert, filePath) => {
        const client = await dbUtil.connectToMongo();
        const db = client.db(DB_NAME);
        const bucket = new GridFSBucket(db, { bucketName: 'songs' }); // GridFS bucket for MP3 files
    
    
        if (filePath) 
        {
            const uploadStream = bucket.openUploadStream(toInsert.title + '.mp3', {
                metadata: {
                    title: toInsert.title,
                    description: toInsert.description,
                    filename: toInsert.filename || (toInsert.title + '.mp3') ,
                    user: toInsert.userId
                }
            });

            const fileStream = fs.createReadStream(filePath);
    
            // Upload MP3 file to GridFS
            await new Promise((resolve, reject) => {
                fileStream.pipe(uploadStream)
                    .on('error', (error) => {
                        reject(error); // Throw error if upload fails
                    })
                    .on('finish', () => {
                        toInsert.songId = uploadStream.id; // Store the GridFS file ID in the metadata
                        resolve();
                    });
            });
        }
    
        // Insert song metadata (including songId) into the collection
        const collection = db.collection(collectionName);
        let result = await collection.insertOne(toInsert);
        await client.close();
        return result.insertedId;
    },

    /*
    Gets all of the song ids in an array
    */
    getAllSongIds: async () => {
        const client = await dbUtil.connectToMongo();
        const database = client.db('yousound');
        const songsCollection = database.collection('songs.files');
    
        // Find only the _id field
        const songs = await songsCollection.find({}, { projection: { _id: 1 } }).toArray();
        
        // Extract and return the IDs in an array
        return songs.map(songs => songs._id);
    },

    /*
    This retrieves the song metadata for a specific songId from GridFS.
    */
    getSongMetadataById: async (songId) => {
        const client = await dbUtil.connectToMongo();
        const db = client.db(DB_NAME);
        const bucket = new GridFSBucket(db, { bucketName: 'songs' });

        try {
            // Fetch metadata for the specific songId
            const songMetadata = await db.collection('songs.files').findOne({ _id: new ObjectId(songId) });

            if (!songMetadata) {
                throw new Error('Song not found'); 
            }

            return songMetadata; 
        } catch (error) {
            console.error('Error retrieving song metadata by ID:', error);
            throw new Error('Error retrieving song metadata by ID');
        } finally {
            await client.close(); 
        }
    },
    
    /*
    Returns a download stream from GridFS, which can then be piped into a response object
    */
    getSongDownloadStreamById: async (songId) => {
        const client = await MongoClient.connect(DB_URI);
        const db = client.db('yousound');
        const bucket = new GridFSBucket(db, { bucketName: 'songs' });
        return bucket.openDownloadStream(songId);
    }
}