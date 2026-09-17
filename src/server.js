const initApp = require("./app");

const PORT = process.env.PORT || 3000;

const baseURL = process.env.BASE_URL;

async function startServer() {
  try {
    const app = await initApp();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Application - ${baseURL}`);
      console.log(`GraphQL endpoint - ${baseURL}/graphql`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();