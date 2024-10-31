const path = require("path");
const {authenticate} = require("../ports/auth/authentication");

module.exports = {
    initialize : (app) => {
        /*
        Endpoint: POST /api/auth/login
        Description: Attempts to log a user in with the given credentials
        and gives a new token if successful
        Authentication: None

        Expected request body: {username, password}
        Status codes and responses:
        200 - OK 
            {message, token, id}
        401 - Incorrect credentials
            {message}
        500 - Server error
            {message}
        */
        app.post("/api/auth/login", async (req, res) => {
            try {     
                if (!(req.body.username && req.body.password)) {
                    return res.status(400).send({message : "Not all info provided"});
                }

                let authenticationResult = authenticate(req.body.username, req.body.password);

                if (authenticationResult) {
                    res.status(200).send({message : "Login successful!", token : authenticationResult.token, id : authenticationResult.id});
                } else {
                    res.status(401).send({message : "Username or password was incorrect"});
                }
            } catch (error) {
                console.error(error);
                res.status(500).send({message : "Server error"});
            }
        });

        console.log("Auth API routes initialized");
    }
}