const prisma = require("../src/config/prisma");
const { DateTimeResolver } = require('graphql-scalars');
const { GraphQLError } = require('graphql');

const requireAuth = (context) => {
  if (!context.user) {
    throw new GraphQLError("You must be logged in to perform this action.", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
};
// Server Side rendering only published status
const resolvers = {
  DateTime: DateTimeResolver,
  Query: {
    newsPosts: async (_, args, context) => {
      if (context.user) {
        return await prisma.newsPost.findMany();
      }
      return await prisma.newsPost.findMany({
        where: { status: "published" }
      });
    },
    
    newsPost: async (_, { id }, context) => {
      const post = await prisma.newsPost.findUnique({ where: { id } });
      if (!post || (post.status !== "published" && !context.user)) {
        return null;
      }
      return post;
    },

    pageContents: async () => await prisma.pageContent.findMany(),
    pageContent: async (_, { id }) => await prisma.pageContent.findUnique({ where: { id } }),

    houseTypes: async (_, args, context) => {
      if (context.user) {
        return await prisma.houseType.findMany();
      }
      return await prisma.houseType.findMany({
        where: { status: "published" }
      });
    },

    houseType: async (_, { id }, context) => {
      const house = await prisma.houseType.findUnique({ where: { id } });
      if (!house || (house.status !== "published" && !context.user)) {
        return null;
      }
      return house;
    },
  },

  Mutation: {
    createNewsPost: async (_, args, context) => {
      requireAuth(context); 
      return await prisma.newsPost.create({
        data: args
      });
    },
    deleteNewsPost: async (_, { id }, context) => {
      requireAuth(context); 
      return await prisma.newsPost.delete({
        where: { id }
      });
    }
  }
};

module.exports = resolvers;