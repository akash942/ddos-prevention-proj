# Use the official Node.js LTS image as the base
FROM node:18

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Install nodemon for hot-reloading during development
RUN npm install -g nodemon

# Expose the application port
EXPOSE 3000

# Use nodemon for development to enable live code reloading
CMD ["nodemon", "server.js"]
