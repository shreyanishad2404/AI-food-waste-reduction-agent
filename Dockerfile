# Use official Node.js LTS slim image
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies (none in this project, but good practice)
RUN npm install --omit=dev 2>/dev/null || true

# Copy all source files
COPY . .

# Expose port (Cloud Run uses PORT env variable, default 8080)
EXPOSE 8080

# Set PORT env variable for Cloud Run compatibility
ENV PORT=8080

# Start the server
CMD ["node", "server.js"]
