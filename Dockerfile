# Stage 1: Build the React UI
FROM node:18-alpine as ui-build
WORKDIR /app/ui
COPY ui/package*.json ./
RUN npm install
COPY ui/ ./
RUN npm run build

# Stage 2: Setup the Node.js Service
FROM node:18-alpine
WORKDIR /app/service

# Copy service dependencies
COPY service/package*.json ./
RUN npm install --production

# Copy service code
COPY service/ ./

# Copy built UI assets from Stage 1 to service/static
COPY --from=ui-build /app/ui/dist ./static

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "index.js"]
