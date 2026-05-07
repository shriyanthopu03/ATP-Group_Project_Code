import exp from "express";
import nodemailer from "nodemailer";
import { config } from "dotenv";
import path from "path";

config();

const router = exp.Router();

async function sendTestEmail() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Missing EMAIL_USER or EMAIL_PASS in environment');
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to:"24eg105h26@anurag.edu.in",
    subject: "Mail from Express + Nodemailer",
    text: "Account Created Successfully by Admin Shriyan",
  });
}

router.get("/send", async (req, res, next) => {
  try {
    await sendTestEmail();
    res.send("Email Sent");
  } catch (err) {
    next(err);
  }
});

export { router as NotificationAPI };

if (path.basename(process.argv[1] ?? '') === 'NotificationAPI.js') {
  const app = exp();
  app.use(router);
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, async () => {
    console.log(`NotificationAPI listening on port ${PORT}`);
    try {
      await sendTestEmail();
      console.log('Email sent successfully');
    } catch (err) {
      console.error('Failed to send email:', err);
    }
  })
}