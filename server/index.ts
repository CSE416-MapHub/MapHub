
import express from 'express';
import mongoose from 'mongoose';
import authRouter from './routes/auth-router'; 
import mapRouter from './routes/map-router';
import postRouter from './routes/post-router';

// const dotenv = require('dotenv');

// dotenv.config();

const app = express();
const cookieParser = require('cookie-parser')
// NOTE: you must pass in the port via
// npm run start -- 8080 
const port = process.argv[2] ?? 3031

// Define your routes and middleware here
// SETUP THE MIDDLEWARE
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// SETUP OUR OWN ROUTERS AS MIDDLEWARE
app.use('/auth', authRouter)
app.use('/map', mapRouter)
app.use('/posts', postRouter)

// Setup DB
mongoose.connect(process.env.MONGODB_URI ?? "mongodb://localhost:27018", {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
}).catch(e => {
  console.error('Connection error', e.message)
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


export default app;