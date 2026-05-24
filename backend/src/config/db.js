const mongoose = require('mongoose');

const connectDB = async () => {
  const connString = process.env.MONGODB_URI || 'mongodb://localhost:27017/execution_platform';
  let retries = 5;
  while (retries > 0) {
    try {
      const conn = await mongoose.connect(connString);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      retries -= 1;
      console.error(`Database connection error: ${error.message}. Retries left: ${retries}`);
      if (retries === 0) {
        process.exit(1);
      }
      // Wait for 3 seconds before retrying
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
};

module.exports = connectDB;
