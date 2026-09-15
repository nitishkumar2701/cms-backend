const express = require("express");
const router = express.Router();
const prisma = require("../config/prisma");

// Unsubscribe Endpoint
router.get("/unsubscribe", async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).send("Invalid request.");

  try {
    await prisma.subscriber.update({
      where: { email },
      data: { consented: false },
    });
    res.send("<h2>You have been successfully unsubscribed.</h2><p>You will no longer receive marketing emails from our platform.</p>");
  } catch (err) {
    res.status(404).send("Subscriber not found.");
  }
});

// Open Tracking Pixel Endpoint
router.get("/track/open", async (req, res) => {
  const { logId } = req.query;
  if (logId) {
    // Update openedAt timestamp asynchronously without blocking response
    prisma.emailLog.update({
      where: { id: logId },
      data: { openedAt: new Date() },
    }).catch(() => {});
  }

  const content = "test"
  res.writeHead(200, {
    "Content-Type": "image/gif",
    "Content-Length":content,
  });
  res.end(content);
});

module.exports = router;