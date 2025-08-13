# Use Node.js 20 as base
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
# Copy lockfile as well to ensure consistent installs
COPY package*.json ./
RUN npm ci --ignore-scripts

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source code and build
COPY . .
RUN npm run build

# Environment variables
ENV PORT=8080
ENV DATABASE_URL=file:/app/dev.db

# Expose port
EXPOSE 8080

# Start server
CMD ["npm", "start"]
