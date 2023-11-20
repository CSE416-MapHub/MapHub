import express from 'express';
import mongoose from 'mongoose';
import authRouter from './routes/auth-router';
import mapRouter from './routes/map-router';
import postRouter from './routes/post-router';
import cookieParser from 'cookie-parser';
import cors from 'cors';

// const dotenv = require('dotenv');

// dotenv.config();

const app = express();

// NOTE: you must pass in the port via
// npm run start -- 8080
const port = process.argv[2] ?? 3031;

// Define your routes and middleware here
// SETUP THE MIDDLEWARE
app.use(
  cors({
    origin: process.env.DEPLOYED
      ? 'https://maphub.pro'
      : 'http://localhost:3000',
    optionsSuccessStatus: 200,
    credentials: true,
  }),
);
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// SETUP OUR OWN ROUTERS AS MIDDLEWARE
app.use('/auth', authRouter);
app.use('/map', mapRouter);
app.use('/posts', postRouter);

// if it is running because of a test, do not connect
if (require.main?.filename.indexOf('.test.') === -1) {
  mongoose
    .connect(process.env.MONGODB_URI ?? 'mongodb://localhost:27017/MapHub', {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    })
    .catch(e => {
      console.error('Connection error', e.message);
    });
}

export const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
