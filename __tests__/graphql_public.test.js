const request = require("supertest");
const app = require("../src/app"); // Adjust path to point to your Express/Apollo app instance

describe("GraphQL Public API - Draft Filtering", () => {
  it("should only return published news posts and never leak drafts to unauthenticated users", async () => {
    // 1. Define the GraphQL query
    const graphqlQuery = {
      query: `
        query GetPublicNews {
          newsPosts {
            id
            title
            status
          }
        }
      `,
    };

    // 2. Send the request to your Express app without any auth cookie
    const response = await request(app)
      .post("/graphql")
      .send(graphqlQuery);

    // 3. Assert the request succeeded structurally
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();

    const posts = response.body.data.newsPosts;

    // 4. Assert that every returned item strictly has the 'published' status
    posts.forEach((post) => {
      expect(post.status).toBe("published");
    });
  });

  it("should return null when an unauthenticated user tries to fetch a single draft item by ID", async () => {
    // Assuming 'draft-id-123' is an ID of a post in your test DB that is currently a draft
    const graphqlQuery = {
      query: `
        query GetSinglePost {
          newsPost(id: "draft-id-123") {
            id
            title
            status
          }
        }
      `,
    };

    const response = await request(app)
      .post("/graphql")
      .send(graphqlQuery);

    expect(response.status).toBe(200);
    
    // Server-side enforcement should return null for unauthorized draft access
    expect(response.body.data.newsPost).toBeNull();
  });
});