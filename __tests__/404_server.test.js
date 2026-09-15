const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/config/prisma");

describe("Express Server Basic Tests", () => {
  // Always close Prisma connection so Jest doesn't hang
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should return a 404 (or handle) when requesting a non-existent route", async () => {
    const response = await request(app).get("/api/this-route-does-not-exist");
    
    // Depending on how your Express app handles 404s, 
    // it will usually return 404 or a JSON error object
    expect(response.status).toBe(404);
  });
});