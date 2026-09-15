require("dotenv").config();
const express = require("express");
const path = require("path");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const expressLayouts = require("express-ejs-layouts");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@as-integrations/express4");
const jwt = require("jsonwebtoken");

// Import UI Routes
const authRoutes = require("./routes/auth.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

// Import GraphQL Schema and Resolvers
const typeDefs = require("../API/schema");
const resolvers = require("../API/resolver");

// Wrap app initialization in an async function for Apollo Server
async function initApp() {
  const app = express();

  // 1. View engine setup for dashboard UI
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "views"));
  app.use(expressLayouts);
  app.set("layout", "partials/layout");

  // 2. Standard Middleware
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, "public")));

  // 3. Page routes (server-rendered dashboard UI)
  app.use("/", authRoutes);
  app.use("/", dashboardRoutes);

  // 4. Initialize Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });
  
  await server.start();

  // 5. GraphQL API route
  app.use(
    "/api/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => {
        // Extract the token from the Authorization header or cookies
        const authHeader = req.headers.authorization || "";
        const token = authHeader.split(" ")[1] || req.cookies.jwt;

        if (token) {
          try {
            // Verify token (Ensure JWT_SECRET is in your .env file)
            const decodedUser = jwt.verify(token, process.env.JWT_SECRET);
            return { user: decodedUser };
          } catch (error) {
            console.error("GraphQL Context: Invalid or expired token");
          }
        }

        // Return a null user if not authenticated
        return { user: null };
      },
    })
  );

  // 6. Health check
  app.get("/health", (req, res) => res.json({ status: "ok" }));

  // 7. 404 Handler
  app.use((req, res) => {
    if (req.originalUrl.startsWith("/api/graphql")) {
      return res.status(404).json({ error: "GraphQL endpoint not found" });
    }
    res.status(404).render("404", { layout: false });
  });

  // 8. Error handler
  app.use((err, req, res, next) => {
    console.error(err);
    if (req.originalUrl.startsWith("/api/graphql")) {
      return res.status(500).json({ error: "Internal server error" });
    }
    res.status(500).send("Internal server error");
  });

  return app;
}

module.exports = initApp;