const dbUtil = require("../database/database-util");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, '../../.env') });
const SECRET_KEY = process.env.JWT_SECRET_KEY;

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
    }
}