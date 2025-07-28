# PC Builder AI - Emergent Deployment Dockerfile
FROM node:18-alpine AS base

# Install Python and system dependencies
RUN apk add --no-cache python3 py3-pip python3-dev build-base

# Create app directory
WORKDIR /app

# Copy package.json and install Node.js dependencies
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile

# Copy all source code
COPY . .

# Install backend dependencies
RUN cd backend && pip3 install -r requirements.txt

# Build frontend for production
RUN cd frontend && NODE_ENV=production yarn build

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 80

# Set environment variables
ENV NODE_ENV=production
ENV PORT=80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:80/health || exit 1

# Start the application
CMD ["node", "server.js"]