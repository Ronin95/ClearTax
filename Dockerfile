# Use official Node.js image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files (excluding those in .dockerignore)
COPY . .

# Expose port 3000
EXPOSE 3000

# Start the app
CMD ["node", "src/index.js"]