const { gql } = require('graphql-tag');

const typeDefs = gql`
  scalar DateTime

  type NewsPost {
    id: Int!
    title: String!
    body: String!
    authorName: String
    imageUrl: String
    category: String
    tags: [String!]!
    section: String
    status: String!
    publishedAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type PageContent {
    id: Int!
    title: String!
    sectionId: String!
    sectionTitle: String!
    sectionSubtitle: String
    sectionBody: String!
    imageUrl: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type HouseType {
    id: Int!
    name: String!
    berRating: String
    style: String
    description: String
    images: [String!]!
    price: Float
    floors: Int
    bedrooms: Int
    bathrooms: Int
    floorAreaSqm: Float
    floorAreaSqft: Float
    garageSpaces: Int
    status: String!
    publishedAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Query {
    # NewsPost Queries
    newsPosts: [NewsPost!]!
    newsPost(id: Int!): NewsPost
    
    # PageContent Queries
    pageContents: [PageContent!]!
    pageContent(id: Int!): PageContent

    # HouseType Queries
    houseTypes: [HouseType!]!
    houseType(id: Int!): HouseType
  }

  # Example Mutations for NewsPost (you can replicate for others)
  type Mutation {
    createNewsPost(title: String!, body: String!, authorName: String, status: String): NewsPost!
    deleteNewsPost(id: Int!): NewsPost!
  }
`;

module.exports = typeDefs;