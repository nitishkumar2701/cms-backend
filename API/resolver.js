const prisma = require("../src/config/prisma");
const { DateTimeResolver } = require('graphql-scalars');

const resolvers = {
  DateTime: DateTimeResolver, // Handles Prisma's DateTime objects automatically

  Query: {
    newsPosts: async () => await prisma.newsPost.findMany(),
    newsPost: async (_, { id }) => await prisma.newsPost.findUnique({ where: { id } }),
    
    pageContents: async () => await prisma.pageContent.findMany(),
    pageContent: async (_, { id }) => await prisma.pageContent.findUnique({ where: { id } }),
    
    houseTypes: async () => await prisma.houseType.findMany(),
    houseType: async (_, { id }) => await prisma.houseType.findUnique({ where: { id } }),
  },

  Mutation: {
    createNewsPost: async (_, args) => {
      return await prisma.newsPost.create({
        data: args
      });
    },
    deleteNewsPost: async (_, { id }) => {
      return await prisma.newsPost.delete({
        where: { id }
      });
    }
  }
};

module.exports = resolvers;