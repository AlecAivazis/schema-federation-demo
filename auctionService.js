const { ApolloServer, gql } = require("apollo-server");
const { fromGlobalId, toGlobalId } = require("graphql-relay");

//
// The GraphQL schema
//
const typeDefs = gql`
  interface Node {
    id: ID!
  }

  type User implements Node {
    id: ID!
    username: String!
    auctionHistory: [Auction]
  }

  type Auction implements Node {
    id: ID!
    name: String!
    photo: Photo!
    offers: [Bid]
    highestOffer: Bid
  }

  type Bid {
    user: User!
    amount: Int!
    auction: Auction!
  }

  type Photo implements Node {
    id: ID!
  }

  type Query {
    node(id: ID!): Node
    allAuctions: [Auction!]!
  }
`;

//
// Demo data
//
const users = {
  "1": {
    id: "1",
    username: "username1"
  }
};

const auctions = {
  "1": {
    id: "1",
    photo: "1",
    creator: "1"
  }
};

const bids = {
  "1": {
    user: "1",
    auction: "1",
    amount: 10
  }
};

const photos = {
  "1": {
    id: "1"
  }
};

//
// A map of functions which return data for the schema.
//
const resolvers = {
  User: {
    id: root => toGlobalId("User", root.id),
    auctionHistory: root =>
      Object.values(auctions).filter(({ creator }) => creator === root.id)
  },
  Auction: {
    id: root => toGlobalId("Auction", root.id),
    photo: root => photos[root.id],
    offers: root =>
      Object.values(bids).filter(({ auction }) => auction === root.id),
    highestOffer: root =>
      Object.values(bids)
        .filter(({ auction }) => auction === root.id)
        .sort((a, b) => b.amount - a.amount)[0]
  },
  Photo: {
    id: root => toGlobalId("Photo", root.id)
  },
  Bid: {
    auction: root => auctions[root.auction]
  },
  Query: {
    node: (_, { id }) => {
      // grab the meta data from the id
      const { type, id: objId } = fromGlobalId(id);

      // return the appropriate object given the type and id
      const node = {
        Auction: auctions,
        User: users,
        Photo: photos
      }[type][objId];

      return {
        ...node,
        _graphqlType: type
      };
    },
    allAuctions: () => Object.values(auctions)
  },
  Node: {
    __resolveType: obj => obj._graphqlType
  }
};

// start the server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  debug: true
});

server.listen(3000).then(({ url }) => console.log("Listening at", url));
