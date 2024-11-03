const auth = require("./authController");
const users = require("./userController");
const music = require("./songController")

module.exports = {
    /*
    Adds API routes to the given Express app
    */
    initialize : (app) => {
        // Initialize test route
        app.get('/api', (req, res) => {
            res.status(200).send({ message: 'Test message from server' });
        });

        
        // Initialize other API routes
        auth.initialize(app);
        users.initialize(app);
        music.initialize(app);
    }
}