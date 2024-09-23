# YouSound

## How to Run
To run the app, you will need to install Node.js and npm.

First, clone this repo to your local machine.
```
git clone https://github.com/pehilbert/yousound
```
Then, you will need to install all the dependencies. To do this, navigate to the root directory of the project and run:
```
npm install
```
Navigate to the `frontend` and `server` directories and run the same command.

Now, navigate back to the root directory.

Before running the app, you will need to set the environment mode. To do this, run either `npm run set-dev` or `npm run set-prod` for
development and production mode respectively.

In development mode, it will run the React app on a test server on port 3000, and the main server separately on port 5000. When ran, a browser window should open
automatically, but if not, the app can be accessed via http://localhost:3000 (or the actual URL to the server)

In production mode, it will build the React app into static content, which the main server will serve directly, running on on port 5000. The app can be accessed
via http://localhost:5000 (or the actual URL to the server)

Once the environment mode is set, run `npm start` in the root directory to run the app.
