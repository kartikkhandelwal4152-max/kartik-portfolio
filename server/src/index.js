import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createApp } from './app.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kartik_portfolio';

let lastDbError = 'Connecting to database...';

const app = createApp({
  getDbError: () => lastDbError
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Portfolio backend running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📄 Resume PDF:   http://localhost:${PORT}/api/resume/pdf`);
  console.log(`📝 Resume Word:  http://localhost:${PORT}/api/resume/docx`);
});

async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    lastDbError = null;
    return;
  }

  const uri = process.env.MONGODB_URI || 'mongodb+srv://madhurawat4152_db_user:gVcvRpjiEKyMtrq4@kartik.qwqplw0.mongodb.net/kartik_portfolio?retryWrites=true&w=majority';

  try {
    console.log(`⏳ Connecting to MongoDB at ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}...`);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    lastDbError = null;
    console.log('✅ Connected to MongoDB successfully.');
  } catch (error) {
    lastDbError = error.message;
    console.warn('⚠️  MongoDB connection failed:', error.message);
  }
}

connectToDatabase();
setInterval(() => {
  if (mongoose.connection.readyState !== 1) {
    connectToDatabase();
  }
}, 10000);

const stop = () => server.close(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  process.exit(0);
});

process.on('SIGTERM', stop);
process.on('SIGINT', stop);
