# Use the official Node.js image as the base image
FROM node:18-alpine AS build

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --force

# Copy the rest of the application code
COPY . .

# Build the Angular application
RUN npm run build --prod

# Use an Nginx image to serve the app
FROM nginx:1.23-alpine

# Copy the build output to Nginx's HTML folder
COPY --from=build /app/dist/tms-ui-v2 /usr/share/nginx/html

# Copy the custom Nginx configuration files
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# Expose the port the app will run on
EXPOSE 4300

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
