const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
dotenv.config();
const app = express();
connectDB();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});
app.use('/api/auth', require('./routes/auth'));
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});
