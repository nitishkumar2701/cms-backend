const axios = require("axios");

exports.pingFrontend = async () => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3001"; 
  const token = process.env.REVALIDATION_TOKEN;
  
  try {
    // Axios automatically handles the POST request securely
    await axios.post(`${frontendUrl}/api/revalidate?secret=${token}`);
    console.log("Successfully pinged frontend to rebuild!");
  } catch (error) {
    console.error("Failed to ping frontend:", error.message);
  }
};