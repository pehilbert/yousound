// General functions for database access
// - Database connection
// - CRUD Operations

const {MongoClient} = require("mongodb");
const {DB_URI, DB_NAME} = require("../vars");

/*
Functions
*/
module.exports = {
    /*
    Database connection function, returns resulting client object given a connection url
    */
    connectToMongo : async () => {
        return await MongoClient.connect(DB_URI);
    },

    /*
    Performs functionality on a given collection defined by the given callback function,
    which takes the collection object as a parameter. Returns the result of the callback function
    or throws an error if something goes wrong
    */
    performOperation: async (collectionName, callback) => {
        let client;

        try {
            client = await module.exports.connectToMongo();
            const db = client.db(DB_NAME);

            const collection = await db.collection(collectionName, { strict: true });

            return await callback(collection);
        } catch (error) {
            console.error(error); // Log the error for debugging purposes
            throw error;
        } finally {
            if (client) {
                await client.close(); // Ensure the client is properly closed after operation
            }
        }
    },

    /*
    Creates a document in a collection given an object with values, returns the
    inserted ID, or throws an error if unable to insert
    */
    createDocument : async (collectionName, toInsert) => {
        return await module.exports.performOperation(collectionName, async (collection) => {
            let result = await collection.insertOne(toInsert);
            return result.insertedId;
        });
    },

    /* 
    Retrieves a single document in a collection with a filter object and returns
    the found object, returns null if not found. Assumes the given ID is already an ObjectId
    object
    */
    getDocument : async (collectionName, filter, projection = null) => {
        return await module.exports.performOperation(collectionName, async (collection) => {
            return await collection.findOne(filter, projection);
        });
    },

    /* 
    Retrieves documents in a collection with a given filter object and returns
    an array of the found documents
    */
    getDocuments : async (collectionName, filter, projection = null) => {
        return await module.exports.performOperation(collectionName, async (collection) => {
            return await collection.find(filter, projection).toArray();
        });
    },

    /* 
    Updates a single document in a collection with a certain ID given an update object, 
    returns the result object. Assumes the given ID is already an
    ObjectId object
    */
    updateDocument : async (collectionName, filter, update) => {
        return await module.exports.performOperation(collectionName, async (collection) => {
            return await collection.updateOne(filter, update);
        });
    },

    /* 
    Updates documents in a collection with a given filter object and an update 
    object, returns the result object
    */
    updateDocuments : async (collectionName, filter, update) => {
        return await module.exports.performOperation(collectionName, async (collection) => {
            return await collection.updateMany(filter, update);
        });
    },

    /*
    Deletes a single document in a collection with a certain ID, and returns
    the result object. Assumes the given ID is already an ObjectId object
    */
    deleteDocument : async (collectionName, filter) => {
        return await module.exports.performOperation(collectionName, async (collection) => {
            return await collection.deleteOne(filter);
        })
    },

    /*
    Deletes documents in a collection with a given filter object, and returns
    the result object
    */
    deleteDocuments : async (collectionName, filter) => {
        return await module.exports.performOperation(collectionName, async (collection) => {
            return await collection.deleteMany(filter);
        })
    }
}