const dbUtil = require("./database-util");
const { ObjectId, GridFSBucket, MongoClient } = require("mongodb");

const DB_URI = process.env.DB_URI;

async function createSong(songData, filePath) {
    return dbUtil.createMp3Document("songs", songData, filePath);
}

async function getRandomSongMetadata() {
    const client = await MongoClient.connect(DB_URI);
    const db = client.db("yousound");
    const songIds = await dbUtil.getAllSongIds();
    const bucket = new GridFSBucket(db, { bucketName: "songs" });

    if (!songIds || songIds.length === 0) {
        throw new Error("No song IDs found");
    }

    const randomSongId = songIds[Math.floor(Math.random() * songIds.length)];
    const songMetadata = await dbUtil.getSongMetadataById(randomSongId);

    return { randomSongId, bucket, songMetadata };
}

module.exports = {
    createSong,
    getRandomSongMetadata
};