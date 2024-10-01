const auth = require("./api-auth");
const users = require("./api-users");

module.exports = {
    /*
    Adds API routes to the given Express app
    */
    initialize : (app) => {
        // Initialize test route
        app.get('/api', (req, res) => {
            res.json({ message: 'Test message from server' });
        });

        // Initialize other API routes
        auth.initialize(app);
        users.initialize(app);
    }
}