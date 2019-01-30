const { ApolloServer, gql } = require("apollo-server");

// a map of user ids and their last name
const lastNames = {
  1: "World",
  2: "Moon"
};

// The GraphQL schema
const typeDefs = gql`
  type User implements Node {
    id: ID!
    lastName: String!
  }

  interface Node {
    id: ID!
  }

  type Query {
    node(id: ID!): Node
  }
`;

// A map of functions which return data for the schema.
const resolvers = {
  User: {
    lastName: root => lastNames[root.id]
  },
  Query: {
    node: (_, { id }) => ({
      id
    })
  },
  Node: {
    __resolveType: () => "User"
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  debug: true
});

server.listen(4000);
