
import express from 'express';
import mongoose from 'mongoose';
// const dotenv = require('dotenv');

// dotenv.config();

const app = express();
// NOTE: you must pass in the port via
// npm run start -- 8080 
const port = process.argv[2]

// Define your routes and middleware here

mongoose.connect(process.env.MONGODB_URI!, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


export default  app