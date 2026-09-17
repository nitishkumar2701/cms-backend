const express = require("express");
const router = express.Router();
const prisma = require("../config/prisma");
const { Buffer } = require("buffer");

const TRANSPARENT_GIF = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

// Handle Unsubscribe Endpoint
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

router.get("/track/open", async (req, res) => {
  const { logId } = req.query;
  if (logId) {
    prisma.emailLog.update({
      where: { id: logId },
      data: { openedAt: new Date() },
    }).catch(() => {});
  }

  res.writeHead(200, {
    "Content-Type": "image/gif",
    "Content-Length": TRANSPARENT_GIF.length,
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
  });
  res.end(TRANSPARENT_GIF);
});

module.exports = router;