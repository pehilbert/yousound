const dbUtil = require("./database-util");
const bcrypt = require("bcrypt");
const { ObjectId } = require('mongodb');

async function createUser(data, saltRounds) {
    const hashedPassword = await bcrypt.hash(data.password, parseInt(saltRounds));
    const result = await dbUtil.createDocument("users", { ...data, password: hashedPassword });
    return result.toString();
}

async function getUserById(id) {
    const result = await dbUtil.getDocument("users", { _id: new ObjectId(id) }, { username: true });
    return result;
}

module.exports = {
    createUser,
    getUserById
};