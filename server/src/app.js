import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { pdfResume, wordResume } from './resume.js';

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    message: { type: String, required: true, trim: true, maxlength: 3000 }
  },
  { timestamps: true }
);

export const Contact = mongoose.models.Contact || mongoose.model('Contact', schema);

export function validateContact(body) {
  if (!body || typeof body !== 'object') return null;
  const { name, email, message } = body;
  if ([name, email, message].some(v => typeof v !== 'string')) return null;

  const data = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    message: message.trim()
  };

  if (
    data.name.length < 2 ||
    data.name.length > 80 ||
    data.email.length > 254 ||
    !/^\S+@\S+\.\S+$/.test(data.email) ||
    data.message.length < 10 ||
    data.message.length > 3000
  ) {
    return null;
  }

  return data;
}

export function createApp({
  saveContact = data => Contact.create(data),
  isReady = () => mongoose.connection.readyState === 1
} = {}) {
  const app = express();
  app.set('trust proxy', 1);
  app.use(helmet());

  const defaultOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4173',
    'http://127.0.0.1:4173'
  ];
  const envOrigins = (process.env.CLIENT_ORIGIN || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  const origins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

  app.use(
    cors({
      origin(origin, cb) {
        if (!origin || origins.includes(origin)) {
          cb(null, true);
        } else {
          cb(Object.assign(new Error('Origin not allowed'), { status: 403 }));
        }
      }
    })
  );

  app.use(express.json({ limit: '16kb' }));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.status(isReady() ? 200 : 503).json({
      status: isReady() ? 'ok' : 'database_unavailable'
    });
  });

  // Contact messages are private. Inspect them through authenticated database tools.
  // No public endpoint lists submissions.

  // Submit contact message
  app.post(
    '/api/contact',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 10,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      message: { message: 'Too many messages. Please try again in 15 minutes.' }
    }),
    async (req, res, next) => {
      try {
        if (req.body?.website) {
          return res.status(400).json({ message: 'Unable to accept this submission.' });
        }
        const data = validateContact(req.body);
        if (!data) {
          return res
            .status(400)
            .json({ message: 'Enter a name (2–80 characters), valid email and message (10–3000 characters).' });
        }
        if (!isReady()) {
          return res
            .status(503)
            .json({ message: 'Contact service is temporarily unavailable. Please try again later.' });
        }
        await saveContact(data);
        res.status(201).json({ message: 'Message received.' });
      } catch (error) {
        next(error);
      }
    }
  );

  // Resume download
  app.get('/api/resume/:format', async (req, res, next) => {
    try {
      const { format } = req.params;
      if (!['pdf', 'docx'].includes(format)) {
        return res.status(400).json({ message: 'Choose PDF or DOCX.' });
      }
      const custom = fileURLToPath(new URL(`../files/Kartik_Khandelwal_Resume.${format}`, import.meta.url));
      if (existsSync(custom)) {
        return res.download(custom);
      }

      res.attachment(`Kartik_Khandelwal_Resume.${format}`);
      if (format === 'pdf') {
        res.type('application/pdf');
        const doc = pdfResume();
        doc.on('error', next);
        doc.pipe(res);
        doc.end();
      } else {
        res.type('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.send(await wordResume());
      }
    } catch (error) {
      next(error);
    }
  });

  // 404 handler
  app.use((_req, res) => res.status(404).json({ message: 'Route not found.' }));

  // Error handler
  app.use((error, _req, res, _next) => {
    if (res.headersSent) return res.end();
    const status = error.status || 500;
    res.status(status).json({
      message:
        status === 500
          ? 'Server error. Please try again later.'
          : status === 413
          ? 'Message is too large.'
          : status === 403
          ? 'Origin not allowed.'
          : 'Invalid request.'
    });
  });

  return app;
}
