const { ApolloServer, gql } = require("apollo-server");

// The GraphQL schema
const typeDefs = gql`
  enum Species {
    Dog
    Cat
  }

  type Animal {
    id: ID!
    species: Species
    breed: String!
  }

  type Photo {
    id: ID!
    animal: Animal
    url: String!
  }

  type User {
    id: ID!
    favoritePhoto: Photo
    photoGallery: [Photo]
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
