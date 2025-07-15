FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
# Nginx will listen on port 80 inside the container
CMD ["nginx", "-g", "daemon off;"]