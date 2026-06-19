FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code and prisma schema
COPY . .

# Generate prisma client
RUN npx prisma generate

# Expose backend port
EXPOSE 5000

# Start server
CMD ["npm", "start"]
