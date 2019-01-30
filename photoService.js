const { ApolloServer, gql } = require("apollo-server");
const { fromGlobalId, toGlobalId } = require("graphql-relay");

//
// The GraphQL schema
//
const typeDefs = gql`
  interface Node {
    id: ID!
  }

  enum Species {
    Dog
    Cat
  }

  type Pet {
    name: String!
    id: ID!
    species: Species
    breed: String!
    owner: User!
    photos: [Photo!]!
  }

  type Photo implements Node {
    id: ID!
    pet: Pet!
    url: String!
  }

  type User implements Node {
    id: ID!
    favoritePhoto: Photo
    photoGallery: [Photo]
  }

  type Query {
    node(id: ID!): Node
  }
`;

//
// Demo data
//
const users = {
  "1": {
    id: "1",
    favoritePhoto: "1",
    photoGallery: ["1"]
  }
};

const pets = {
  "1": {
    id: "1",
    name: "No Creativity",
    species: "Cat",
    breed: "Hello",
    owner: "1"
  }
};

const photos = {
  "1": {
    id: "1",
    pet: "1",
    url: "awesome-url"
  }
};

//
// A map of functions which return data for the schema.
//
const resolvers = {
  Pet: {
    id: root => toGlobalId("Pet", root.id),
    owner: root => users[root.owner],
    photos: root => Object.values(photos).filter(({ pet }) => pet === root.id)
  },
  Photo: {
    id: root => toGlobalId("Photo", root.id),
    pet: root => pets[root.pet]
  },
  User: {
    id: root => toGlobalId("User", root.id),
    favoritePhoto: root => photos[root.favoritePhoto],
    photoGallery: root => root.photoGallery.map(id => photos[id])
  },
  Query: {
    node: (_, { id }) => {
      // grab the meta data from the id
      const { type, id: objId } = fromGlobalId(id);

      // return the appropriate object given the type and id
      const node = {
        Pet: pets,
        User: users,
        Photo: photos
      }[type][objId];

      return {
        ...node,
        _graphqlType: type
      };
    }
  },
  Node: {
    __resolveType: obj => obj._graphqlType
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen(3001).then(({ url }) => console.log("Listening at", url));
