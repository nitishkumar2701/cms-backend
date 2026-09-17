const express = require("express");
const router = express.Router();
const prisma = require("../config/prisma");
const { requireAuthPage } = require("../middleware/auth");

//Handle CMS Dashboard
router.get("/dashboard", requireAuthPage, async (req, res) => {
  try {
    const [newsCount,pageCount, houseCount, publishedNews, publishedHouses,draftHouses, draftNews,subscriberCount] =
      await Promise.all([
        prisma.newsPost.count(),
        prisma.pageContent.count(),
        prisma.houseType.count(),
        prisma.newsPost.count({ where: { status: "published" } }),
        prisma.houseType.count({ where: { status: "published" } }),
        prisma.houseType.count({ where: { status: "draft" } }),
        prisma.newsPost.count({ where: { status: "draft" } }),
        prisma.subscriber.count(),
      ]);

    res.render("dashboard", {
      title: "Dashboard",
      active: "dashboard",
      stats: { newsCount, pageCount, houseCount, publishedNews, publishedHouses,draftHouses,draftNews,subscriberCount },
    });
  } catch (err) {
    console.error(err);
    res.status(500).render("dashboard", {
      title: "Dashboard",
      active: "dashboard",
      stats: { newsCount: 0, pageCount: 0, houseCount: 0, publishedNews: 0, publishedHouses: 0,draftHouses:0,draftNews:0,subscriberCount:0 },
    });
  }
});

//Handle New Posts Route
router.get("/news-posts", requireAuthPage, (req, res) => {
  res.render("news-posts", { title: "News Posts", active: "news-posts" });
});
//Handle Page Content Route
router.get("/page-content", requireAuthPage, (req, res) => {
  res.render("page-content", { title: "Page Content", active: "page-content" });
});
//Handle House Types Route
router.get("/house-types", requireAuthPage, (req, res) => {
  res.render("house-types", { title: "House Types", active: "house-types" });
});

router.get("/", requireAuthPage, (req, res) => res.redirect("/dashboard"));

module.exports = router;
