import nodemailer from 'nodemailer';

// Optional SMTP notification. MongoDB remains the source of truth for submissions.
export function createNotifier(env = process.env) {
  if (!env.SMTP_HOST || !env.SMTP_FROM || !env.CONTACT_NOTIFY_TO) return async () => {};
  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT || 587),
    secure: env.SMTP_SECURE === 'true',
    auth: env.SMTP_USER && env.SMTP_PASS ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000
  });
  return data => transport.sendMail({
    from: env.SMTP_FROM,
    to: env.CONTACT_NOTIFY_TO,
    replyTo: data.email,
    subject: 'New portfolio contact message',
    text: `Name: ${data.name}\nEmail: ${data.email}\n\n${data.message}`
  });
}
