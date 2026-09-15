const express = require("express");
const router = express.Router();
const prisma = require("../config/prisma");
const { requireAuthPage } = require("../middleware/auth");
const { sendEmailCampaign } = require("../services/campaignWorker");

// View email logs / history
router.get("/dashboard/campaigns", requireAuthPage, async (req, res) => {
  const logs = await prisma.emailLog.findMany({
    include: { subscriber: true },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  res.render("campaign-logs", { 
    logs, 
    active: "campaigns", 
    title: "Email Campaigns" 
  });
});

// Create Campaign Form
router.get("/dashboard/campaigns/new", requireAuthPage, async (req, res) => {
  const newsPosts = await prisma.newsPost.findMany({ where: { status: "published" } });
  res.render("campaign-new", { 
    newsPosts, 
    active: "campaigns", 
    title: "Compose Campaign" 
  });
});

// Handle Campaign Submission
router.post("/dashboard/campaigns", requireAuthPage, async (req, res) => {
  const { subject, body, newsPostId } = req.body;
  const parsedNewsPostId = newsPostId ? parseInt(newsPostId, 10) : null;
  sendEmailCampaign({
    subject,
    body,
    newsPostId: parsedNewsPostId
  });

  res.redirect("/dashboard/campaigns");
});

module.exports = router;