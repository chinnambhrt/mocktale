FROM node:18-alpine
WORKDIR /app/service

# Copy service dependencies
COPY service/package*.json ./
RUN npm install --production

# Copy service code (including static/ folder)
COPY service/ ./

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "index.js"]
