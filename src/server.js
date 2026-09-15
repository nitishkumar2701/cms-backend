const initApp = require("./app");

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    const app = await initApp();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Application - http://localhost:${PORT}`);
      console.log(`GraphQL endpoint - http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();