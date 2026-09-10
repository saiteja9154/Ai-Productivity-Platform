# Production Dockerfile for AI Productivity Platform Backend
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies first for optimal layer caching
COPY package*.json ./
RUN npm install --omit=dev

# Copy application source code
COPY src/ ./src/

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose backend service port
EXPOSE 5000

# Start server
CMD ["node", "src/server.js"]
