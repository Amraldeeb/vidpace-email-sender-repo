const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { sendEmail } = require("./mailer");

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    error: "Too many email requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to email endpoint
app.use("/api/send-email", limiter);

// Middleware
app.use(cors());
app.use(express.json());

// New endpoint for generating email template
app.post("/api/generate-email-template", (req, res) => {
  const { recipientName, senderName, messageBody } = req.body;

  if (!recipientName || !senderName || !messageBody) {
    return res.status(400).json({ error: "All required fields (recipientName, senderName, messageBody) must be provided." });
  }

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vidpace Email</title>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .email-container { max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
            .header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eeeeee; }
            .header img { max-width: 150px; height: auto; }
            .content { padding: 20px 0; line-height: 1.6; color: #333333; }
            .button-container { text-align: center; padding-top: 20px; }
            .button { display: inline-block; background-color: #007bff; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
            .footer { text-align: center; padding-top: 20px; border-top: 1px solid #eeeeee; color: #777777; font-size: 0.9em; }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <img src="https://example.com/vidpace-logo.png" alt="Vidpace Logo">
            </div>
            <div class="content">
                <p>Hi ${recipientName},</p>
                <p>This is ${senderName} from Vidpace.</p>
                <p>${messageBody}</p>
                <p>Regards,</p>
                <p>${senderName},</p>
                <p>Vidpace Team</p>
            </div>
            <div class="button-container">
                <a href="https://www.vidpace.com/schedule-meeting" class="button">Schedule A Quick Meeting</a>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Vidpace. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
  res.status(200).json({ htmlTemplate });
});

// Email sending endpoint
app.post("/api/send-email", async (req, res) => {
  const { senderEmail, senderPassword, recipientEmail, recipientName, emailSubject, messageBody, senderName } = req.body;

  // Basic validation
  if (!senderEmail || !senderPassword || !recipientEmail || !emailSubject || !messageBody || !senderName) {
    return res.status(400).json({ error: "All required fields must be provided." });
  }

  try {
    const emailResult = await sendEmail({
      from: `${senderName} <${senderEmail}>`,
      to: recipientEmail,
      subject: emailSubject,
      html: messageBody,
      auth: {
        user: senderEmail,
        pass: senderPassword,
      },
    });

    if (emailResult.success) {
      res.status(200).json({ message: "Email sent successfully!" });
    } else {
      res.status(500).json({ error: emailResult.error || "Failed to send email." });
    }
  } catch (error) {
    console.error("Error in /api/send-email:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

