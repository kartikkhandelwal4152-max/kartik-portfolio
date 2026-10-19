import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createApp } from './app.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const PORT = process.env.PORT || 5001;
const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://madhurawat4152_db_user:gVcvRpjiEKyMtrq4@kartik.qwqplw0.mongodb.net/kartik_portfolio?retryWrites=true&w=majority';

const app = createApp();

const server = app.listen(PORT, () => {
  console.log(`🚀 Portfolio backend running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📄 Resume PDF:   http://localhost:${PORT}/api/resume/pdf`);
  console.log(`📝 Resume Word:  http://localhost:${PORT}/api/resume/docx`);
});

async function connectToDatabase() {
  if (!process.env.MONGODB_URI && process.env.NODE_ENV === 'production') {
    console.error('❌ MONGODB_URI is not set in server/.env or hosting environment.');
    return;
  }

  try {
    console.log(`⏳ Connecting to MongoDB at ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}...`);
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB successfully.');
  } catch (error) {
    console.warn('⚠️  MongoDB connection failed:', error.message);
    console.warn('👉 To store contact form submissions, make sure MongoDB is running locally or set MONGODB_URI (e.g. MongoDB Atlas) in server/.env');
  }
}

connectToDatabase();

const stop = () => server.close(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  process.exit(0);
});

process.on('SIGTERM', stop);
process.on('SIGINT', stop);
