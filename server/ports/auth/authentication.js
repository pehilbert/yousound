const dbUtil = require("../database/database-util");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, '../../.env') });
const SECRET_KEY = process.env.JWT_SECRET_KEY;
const SALT_ROUNDS = process.env.SALT_ROUNDS;

module.exports = {
    // Checks credentials against the database and returns an object with the token and user ID string if correct,
    // otherwise returns null
    authenticate: async (username, password) => {
        let user = await dbUtil.getDocument("users", {username});

        if (user && user.password && bcrypt.compareSync(password, user.password)) {
            let token = jwt.sign({id : user._id}, SECRET_KEY, {expiresIn : "1h"});
            let stringID = user._id.toString();

            return {token, id : stringID};
        }

        return null;
    },
    
    // Takes a plain text password and returns the hashed version
    hashPassword : async (password) => {
        return await bcrypt.hash(password, parseInt(SALT_ROUNDS));
    },

    // Takes a MongoDB error message and tries to determine a human-readable error,
    // returning the proper error message if so. If error is unknown, returns null
    getUserCreationErrorMessage : (error) => {
        if (error.code === 11000) {
            // Handle duplicate key error
            if (error.keyPattern && error.keyPattern.username) {
                return "Username already in use";
            } else if (error.keyPattern && error.keyPattern.email) {
                return "Email already in use";
            }
        }

        return null;
    }
}