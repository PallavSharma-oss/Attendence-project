import mongoose from 'mongoose';

const connectDB = async () => {
  const maxRetries = 10;
  const retryDelayMs = 5000;
  let attempt = 0;

  const mongoUri = process.env.MONGODB_URI || 'mongodb://mongo:27017/attendance';

  // Retry connection so backend can wait for MongoDB during Docker startup.
  while (attempt < maxRetries) {
    attempt += 1;

    try {
      const conn = await mongoose.connect(mongoUri);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`MongoDB connection attempt ${attempt}/${maxRetries} failed: ${error.message}`);

      if (attempt >= maxRetries) {
        console.error('MongoDB connection failed after maximum retries. Exiting process.');
        process.exit(1);
      }

      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }
};

export default connectDB;
