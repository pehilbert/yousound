# Use a Node.js base image
FROM node:16

# Set the working directory inside the container
WORKDIR /

# Copy package files first to leverage Docker cache for dependency installation
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Command to start the application
CMD ["node", "server.js"]