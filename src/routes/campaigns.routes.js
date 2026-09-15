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
    take: 100 // limit to recent logs
  });

  res.render("dashboard/campaigns/index", { 
    logs, 
    active: "campaigns", 
    title: "Email Campaigns" 
  });
});

// Create Campaign Form
router.get("/dashboard/campaigns/new", requireAuthPage, async (req, res) => {
  const newsPosts = await prisma.newsPost.findMany({ where: { status: "published" } });
  res.render("dashboard/campaigns/new", { 
    newsPosts, 
    active: "campaigns", 
    title: "Compose Campaign" 
  });
});

// Handle Campaign Submission & Trigger Background Job
router.post("/dashboard/campaigns", requireAuthPage, async (req, res) => {
  const { subject, body, newsPostId } = req.body;

  // Trigger background job asynchronously with the form data
  sendEmailCampaign({
    subject,
    body,
    newsPostId: newsPostId || null
  });

  res.redirect("/dashboard/campaigns");
});

module.exports = router;