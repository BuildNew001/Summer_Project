const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { globalErrorHandler } = require('./middleware/errorMiddleware'); 
const { startResultPolling } = require('./services/resultQueueConsumer');
const initializeSocket = require('./socket/socketHandler');

dotenv.config();
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true
  }
});

connectDB();
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/problems', require('./routes/problemRoutes')); 
app.use('/api/submissions', require('./routes/submissionRoutes'));
app.use('/api/run', require('./routes/runRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

initializeSocket(io);
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(`CORS origin for sockets and API set to: ${process.env.CLIENT_URL}`);
  startResultPolling(io); 
});
