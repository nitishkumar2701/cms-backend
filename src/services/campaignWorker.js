const prisma = require("../config/prisma");
const { BrevoClient } = require("@getbrevo/brevo");

// Initialize the modern Brevo API client
const brevo = new BrevoClient({
  apiKey: process.env.BREVOKEY,
});

async function sendEmailCampaign({ subject, body, newsPostId }) {
  try {
    // Fetch all active, consented subscribers
    const subscribers = await prisma.subscriber.findMany({
      where: { consented: true },
    });

    let newsPost = null;
    if (newsPostId) {
      newsPost = await prisma.newsPost.findUnique({ where: { id: newsPostId } });
    }

    // Loop through subscribers and dispatch via HTTP API
    for (const sub of subscribers) {
      const log = await prisma.emailLog.create({
        data: {
          subscriberId: sub.id,
          status: "pending",
        },
      });

      const baseUrl = process.env.BASE_URL || "http://localhost:3000";
      const unsubscribeUrl = `${baseUrl}/unsubscribe?email=${encodeURIComponent(sub.email)}`;
      const trackingPixelUrl = `${baseUrl}/track/open?logId=${log.id}`;

      const htmlContent = `
        <div>
          ${body}
          ${newsPost ? `<p><strong>Campaign Related to ${newsPost.title}</strong> </p>` : ""}
          <hr/>
          <p style="font-size: 11px; color: #666;">
            You are receiving this because you subscribed to updates on our platform.<br/>
            <a href="${unsubscribeUrl}">Unsubscribe from future updates</a>
          </p>
          <img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:none;" />
        </div>
      `;

      try {
        // Send email via Brevo's modern HTTP API
        await brevo.transactionalEmails.sendTransacEmail({
          sender: { email: process.env.EMAIL_FROM, name: "IRE Homes CMS" },
          to: [{ email: sub.email }],
          subject: subject,
          htmlContent: htmlContent,
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