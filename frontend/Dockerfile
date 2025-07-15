# Stage 1: Build the React Application 
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm ci

COPY . .

# Set environment and build
ENV NODE_ENV=production
ENV CI=false
ENV VITE_API_BASE_URL=http://localhost:8000

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine AS production-stage

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]






# Note: The following commented-out code is the previous version of the Dockerfile.
# It has been replaced with the above multi-stage build approach for better efficiency and clarity.





# # --- Stage 1: Build the React Application ---
# FROM node:20-alpine AS builder

# WORKDIR /app

# # Copy package files
# COPY package.json ./
# COPY package-lock.json ./

# # Install dependencies (use ci for faster, reliable builds)
# RUN npm ci

# # Copy source code
# COPY . .

# # Set production environment
# ENV NODE_ENV=production

# # Build the application
# RUN npm run build

# # Ensure build directory exists and copy to a standard location
# RUN if [ -d "/app/build" ]; then \
#         echo "Using /app/build"; \
#         cp -r /app/build /app/dist-final; \
#     elif [ -d "/app/dist" ]; then \
#         echo "Using /app/dist"; \
#         cp -r /app/dist /app/dist-final; \
#     elif [ -d "/app/out" ]; then \
#         echo "Using /app/out"; \
#         cp -r /app/out /app/dist-final; \
#     else \
#         echo "No build directory found!"; \
#         ls -la /app; \
#         exit 1; \
#     fi

# # --- Stage 2: Serve the React Application with Nginx ---
# FROM nginx:alpine AS production-stage

# # Remove default nginx config
# RUN rm /etc/nginx/conf.d/default.conf

# # Copy custom nginx config
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# # Copy built application from standardized location
# COPY --from=builder /app/dist-final /usr/share/nginx/html

# # Expose port
# EXPOSE 80

# # Start nginx
# CMD ["nginx", "-g", "daemon off;"]