const express = require('express')
const dotenv = require('dotenv');
const connectDB = require('./config/db')
const {startPolling}=require('./controllers/sqsqueuing')
dotenv.config();
const app = express()
app.use(express.json())
connectDB();
startPolling()
const PORT = process.env.PORT
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
