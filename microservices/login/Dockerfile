# Use a Node.js base image
FROM node:16

# Set the working directory inside the container
WORKDIR /login

# Copy package files first to leverage Docker cache for dependency installation
COPY ./login/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY ./login .

# Get needed utilities
COPY ./util/database-util.js ./util/database-util.js

# Command to start the application
CMD ["node", "server.js"]