const prisma = require("../config/prisma");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendEmailCampaign({ subject, body, newsPostId }) {
  try {
    // 1. Fetch all active, consented subscribers
    const subscribers = await prisma.subscriber.findMany({
      where: { consented: true },
    });

    // 2. Loop through subscribers asynchronously
    for (const sub of subscribers) {
      // Create an email log entry first to get a unique log ID for tracking
      const log = await prisma.emailLog.create({
        data: {
          subscriberId: sub.id,
          status: "pending",
        },
      });

      const baseUrl = process.env.BASE_URL || "http://localhost:3000";
      const unsubscribeUrl = `${baseUrl}/api/unsubscribe?email=${encodeURIComponent(sub.email)}`;
      const trackingPixelUrl = `${baseUrl}/api/track/open?logId=${log.id}`;

      const htmlBody = `
        <div>
          ${body}
          <hr/>
          <p style="font-size: 11px; color: #666;">
            You are receiving this because you subscribed to updates on our platform.<br/>
            <a href="${unsubscribeUrl}">Unsubscribe from future updates</a>
          </p>
          <img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:none;" />
        </div>
      `;

      try {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: sub.email,
          subject: subject,
          html: htmlBody,
        });

        // Mark log as sent
        await prisma.emailLog.update({
          where: { id: log.id },
          data: { status: "sent" },
        });
      } catch (err) {
        console.error(`Failed to send to ${sub.email}:`, err);
        await prisma.emailLog.update({
          where: { id: log.id },
          data: { status: "failed" },
        });
      }
    }
  } catch (error) {
    console.error("Bulk email processing error:", error);
  }
}

module.exports = { sendEmailCampaign };