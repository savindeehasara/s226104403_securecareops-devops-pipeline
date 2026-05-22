# Use an official Node.js runtime as the base image.
# Alpine is lightweight, which keeps the final image smaller.
FROM node:20-alpine

# Set the working directory inside the container.
WORKDIR /usr/src/app

# Copy package files first.
# This improves Docker caching because dependencies only reinstall when package files change.
COPY package*.json ./

# Install only production dependencies for a cleaner runtime image.
RUN npm ci --omit=dev

# Copy the application source code into the container.
COPY src ./src

COPY public ./public

# Expose the application port.
EXPOSE 3000

# Add a simple health check so Docker can verify the container is running correctly.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/health').then(res => process.exit(res.ok ? 0 : 1)).catch(() => process.exit(1))"

# Start the SecureCareOps API.
CMD ["node", "src/server.js"]