const { ApolloServer, gql } = require("apollo-server");

// The GraphQL schema
const typeDefs = gql`
  type User {
    id: ID!
    firstName: String
  }

  type Query {
    allUsers: [User]
  }
`;

// A map of functions which return data for the schema.
const resolvers = {
  Query: {
    allUsers: () => [
      { id: "1", firstName: "Hello" },
      { id: "2", firstName: "Goodbye" }
    ]
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen(4001);
