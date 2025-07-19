FROM node:20-alpine

WORKDIR /app

RUN npm install -g y-websocket

EXPOSE 1234

CMD ["y-websocket", "--port", "1234", "--host", "0.0.0.0"]