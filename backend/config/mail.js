const express = require("express");
const nodemailer = require("nodemailer");

const router = express.Router();

router.post("/register", async (req, res) => {

  const { name, email, password } = req.body;

  try {

    // Save user into database here

    // Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });

    // Mail options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email, // dynamic email from register form
      subject: "Account Created",
      text: `Hello ${name}, your account was created successfully`
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      success: true,
      message: "Account created and email sent"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

});

module.exports = router;