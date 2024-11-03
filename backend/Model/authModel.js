const dbUtil = require("../Model/database-util");

async function findUserByUsername(username) {
    try {
        return await dbUtil.getDocument("users", { username });
    } catch (error) {
        throw new Error("Database error: Unable to retrieve user.");
    }
}

module.exports = { findUserByUsername };