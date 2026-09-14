require("dotenv").config();
const express = require("express");
const path = require("path");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const expressLayouts = require("express-ejs-layouts");

const authRoutes = require("./routes/auth.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const newsPostsRoutes = require("./routes/newsPosts.routes");
const pageContentRoutes = require("./routes/pageContent.routes");
const houseTypesRoutes = require("./routes/houseTypes.routes");

const app = express();

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "partials/layout");

// Middleware
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Page routes (server-rendered dashboard UI)
app.use("/", authRoutes);
app.use("/", dashboardRoutes);

// JSON REST API routes (consumed by dashboard front-end JS, also usable by any client)
app.use("/api/news-posts", newsPostsRoutes);
app.use("/api/page-content", pageContentRoutes);
app.use("/api/house-types", houseTypesRoutes);

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// 404
app.use((req, res) => {
  if (req.originalUrl.startsWith("/api/")) {
    return res.status(404).json({ error: "Not found" });
  }
  res.status(404).render("404", { layout: false });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  if (req.originalUrl.startsWith("/api/")) {
    return res.status(500).json({ error: "Internal server error" });
  }
  res.status(500).send("Internal server error");
});

module.exports = app;
