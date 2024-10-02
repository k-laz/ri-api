# Use the official Node.js image
FROM node:20-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Give execution permissions
RUN chmod +x ./start.sh

# Generate Prisma Client
RUN npx prisma generate

# Expose the port your app runs on
EXPOSE 3000

# Build the TypeScript code
RUN npm run build

#CMD ["npm start"]
CMD ["sh", "./start.sh"]
