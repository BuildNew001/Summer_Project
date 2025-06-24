const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { globalErrorHandler } = require('./middleware/errorMiddleware'); 
dotenv.config();
const app = express();
connectDB();
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});
app.use('/api/auth', require('./routes/auth'));
app.use('/api/problems', require('./routes/problemRoutes')); 
app.use('/api/submissions', require('./routes/submissionRoutes'));
app.use(globalErrorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});
