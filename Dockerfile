# Use the official Node.js image
FROM node:20

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Run Prisma migrations
#RUN npx prisma migrate deploy
RUN npx prisma generate

# Expose the port your app runs on
EXPOSE 3000

# Build the TypeScript code
RUN npm run build

# Start the application
CMD ["./start.sh", "npm", "start"]