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
    firstName: String!
    lastName: String!
    auctionHistory: [Auction]
  }

  type Auction implements Node {
    id: ID!
    name: String!
    photo: Photo!
    offers: [Bid]
    highestOffer: Bid
    user: User!
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
    username: "xXOncomingStormXx",
    firstName: "The",
    lastName: "Doctor"
  },
  "2": {
    id: "2",
    username: "Data",
    firstName: "Data",
    lastName: "Sung"
  },
  "3": {
    id: "3",
    username: "NoRoads1955",
    firstName: "Emmett",
    lastName: "Brown"
  }
};

const auctions = {
  "1": {
    id: "1",
    photo: "1",
    creator: "1"
  },
  "2": {
    id: "2",
    photo: "2",
    creator: "2"
  },
  "3": {
    id: "3",
    photo: "9",
    creator: "3"
  },
  "4": {
    id: "4",
    photo: "2",
    creator: "3"
  },
  "5": {
    id: "5",
    photo: "7",
    creator: "1"
  },
  "6": {
    id: "6",
    photo: "5",
    creator: "2"
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
  },
  "2": {
    id: "2"
  },
  "3": {
    id: "3"
  },
  "4": {
    id: "4"
  },
  "5": {
    id: "5"
  },
  "6": {
    id: "6"
  },
  "7": {
    id: "7"
  },
  "8": {
    id: "8"
  },
  "9": {
    id: "9"
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
        .sort((a, b) => b.amount - a.amount)[0],
    user: root => users[root.creator]
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

server.listen(3001).then(({ url }) => console.log("Listening at", url));
