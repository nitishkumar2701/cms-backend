require("dotenv").config();
const express = require("express");
const path = require("path");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const expressLayouts = require("express-ejs-layouts");
const cors = require("cors");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@as-integrations/express4");
const jwt = require("jsonwebtoken");

// EJS Dashboard Page Routes
const authRoutes = require("./routes/auth.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const publicTrackingRoutes = require("./routes/publicTracking.routes");
const campaignRoutes = require("./routes/campaigns.routes");

// REST API Routes
const newsPostsRoutes = require("./routes/newsPosts.routes");
const pageContentRoutes = require("./routes/pageContent.routes");
const houseTypesRoutes = require("./routes/houseTypes.routes");
const imageUploadRoutes = require('./routes/imageUpload.routes');

// GraphQL Schema and Resolvers 
const typeDefs = require("../API/schema");
const resolvers = require("../API/resolver");

async function initApp() {
  const app = express();

  // CORS - Enables external frontend apps 
  app.use(cors({
    origin: true,
    credentials: true,
  }));

  // View engine setup for dashboard UI
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

  // EJS UI ROUTES
  app.use("/", authRoutes);
  app.use("/", dashboardRoutes);

  // UPDATED: Mounted to "/" so /unsubscribe works directly without /api prefix
  app.use("/", publicTrackingRoutes); 
  app.use("/", campaignRoutes);

  // REST API ENDPOINTS 
  app.use("/api/news-posts", newsPostsRoutes);
  app.use("/api/page-content", pageContentRoutes);
  app.use("/api/house-types", houseTypesRoutes);
  app.use('/api/upload', imageUploadRoutes);

  // GRAPHQL API ENDPOINT 
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });
  
  await server.start();

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => {
        const authHeader = req.headers.authorization || "";
        const token = authHeader.split(" ")[1] || req.cookies.jwt;

        if (token) {
          try {
            const decodedUser = jwt.verify(token, process.env.JWT_SECRET);
            return { user: decodedUser };
          } catch (error) {
            console.error("GraphQL Context: Invalid or expired token");
          }
        }

        return { user: null };
      },
    })
  );

  // Health check
  app.get("/health", (req, res) => res.json({ status: "ok" }));

  // 404 Handler
  app.use((req, res) => {
    if (req.originalUrl.startsWith("/api/")) {
      return res.status(404).json({ error: "REST API route not found" });
    }
    if (req.originalUrl.startsWith("/graphql")) {
      return res.status(404).json({ error: "GraphQL endpoint not found" });
    }
    res.status(404).render("404", { layout: false });
  });

  // Global Error Handler
  app.use((err, req, res, next) => {
    console.error(err);
    if (req.originalUrl.startsWith("/api/") || req.originalUrl.startsWith("/graphql")) {
      return res.status(500).json({ error: "Internal server error" });
    }
    res.status(500).send("Internal server error");
  });

  return app;
}

module.exports = initApp;