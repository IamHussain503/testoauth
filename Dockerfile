FROM node:16

WORKDIR /usr/src/app

# Install build tools
RUN apt-get update && apt-get install -y python g++ make

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Define environment variable
ENV PORT=3000

# Run the app
CMD ["node", "src/index.js"]
