const { ApolloServer, gql } = require("apollo-server");
const { fromGlobalId, toGlobalId } = require("graphql-relay");

// a map of usernames to passwords
const users = {
  "1": {
    username: "hello",
    password: "world"
  },
  "2": {
    username: "goodbye",
    password: "moon"
  }
};

//
// The GraphQL schema
//
const typeDefs = gql`
  type LoginOutput {
    authToken: String!
    refreshToken: String!
  }

  input LoginInput {
    username: String!
    password: String!
  }

  type Mutation {
    login(input: LoginInput!): LoginOutput!
  }

  type Query {
    apiVersion: String!
  }
`;

//
// A map of functions which return data for the schema.
//
const resolvers = {
  Mutation: {
    login: (
      _,
      { input: { username: providedUsername, password: providedPassword } }
    ) => {
      // get the matching username and password
      const userID = Object.keys(users).find(
        id =>
          users[id].username === providedUsername &&
          users[id].password === providedPassword
      );

      // if we didn't find a matching user
      if (!userID) {
        throw new Error("Invalid username/password combination provided");
      }

      // we have to provide tokens that the gateway will use to extract the current user
      return {
        // here is where things get very non-production ready. we're just going to put the user's ID here
        // so that extracting the value is easy. You absolutely want to find a third-party solution for
        // generating secure tokens that you will verify at the gateway.
        authToken: userID,
        // since we don't really have a refresh mechanism in this example let's just send the ID aswell
        refreshToken: userID
      };
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen(3001).then(({ url }) => console.log("Listening at", url));
