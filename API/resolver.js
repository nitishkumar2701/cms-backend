const prisma = require("../src/config/prisma");
const { DateTimeResolver } = require('graphql-scalars');
const { GraphQLError } = require('graphql');

// Optional: A quick helper to protect mutations
const requireAuth = (context) => {
  if (!context.user) {
    throw new GraphQLError("You must be logged in to perform this action.", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
};

const resolvers = {
  DateTime: DateTimeResolver, // Handles Prisma's DateTime objects automatically

  Query: {
    // --- NEWS POSTS ---
    newsPosts: async (_, args, context) => {
      // If admin is logged in, return all. Otherwise, only return published.
      if (context.user) {
        return await prisma.newsPost.findMany();
      }
      return await prisma.newsPost.findMany({
        where: { status: "published" }
      });
    },
    
    newsPost: async (_, { id }, context) => {
      const post = await prisma.newsPost.findUnique({ where: { id } });
      // Block unauthenticated users from fetching a draft by its ID
      if (!post || (post.status !== "published" && !context.user)) {
        return null;
      }
      return post;
    },
    
    // --- PAGE CONTENT ---
    // (Page content doesn't have a status field in your schema, so it remains unchanged)
    pageContents: async () => await prisma.pageContent.findMany(),
    pageContent: async (_, { id }) => await prisma.pageContent.findUnique({ where: { id } }),
    
    // --- HOUSE TYPES ---
    houseTypes: async (_, args, context) => {
      // If admin is logged in, return all. Otherwise, only return published.
      if (context.user) {
        return await prisma.houseType.findMany();
      }
      return await prisma.houseType.findMany({
        where: { status: "published" }
      });
    },

    houseType: async (_, { id }, context) => {
      const house = await prisma.houseType.findUnique({ where: { id } });
      // Block unauthenticated users from fetching a draft by its ID
      if (!house || (house.status !== "published" && !context.user)) {
        return null;
      }
      return house;
    },
  },

  Mutation: {
    createNewsPost: async (_, args, context) => {
      requireAuth(context); // Enforce that only admins can create
      return await prisma.newsPost.create({
        data: args
      });
    },
    deleteNewsPost: async (_, { id }, context) => {
      requireAuth(context); // Enforce that only admins can delete
      return await prisma.newsPost.delete({
        where: { id }
      });
    }
  }
};

module.exports = resolvers;