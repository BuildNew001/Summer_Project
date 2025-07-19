FROM node:20-alpine

WORKDIR /app

# Install y-websocket globally
RUN npm install -g y-websocket

EXPOSE 1234

# Use full path to the global binary
CMD ["/usr/local/bin/y-websocket", "--port", "1234", "--host", "0.0.0.0"]
