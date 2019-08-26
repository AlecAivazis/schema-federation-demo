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
  // the doctor
  "1": {
    id: "1",
    favoritePhoto: "2",
    photoGallery: ["1", "3"]
  },
  // data
  "2": {
    id: "2",
    favoritePhoto: "3",
    photoGallery: ["2", "1"]
  },
  // doc brown
  "3": {
    id: "3",
    favoritePhoto: "1",
    photoGallery: ["1", "2", "3"]
  }
};

const pets = {
  "1": {
    id: "1",
    name: "Spot",
    species: "Cat",
    breed: "Tabby",
    owner: "2"
  },
  "2": {
    id: "2",
    owner: "1",
    name: "K9",
    species: "Dog",
    breed: "Robot"
  },
  "3": {
    id: "3",
    owner: "3",
    name: "Einstein",
    species: "Dog",
    breed: "Sheepdog"
  }
};

const photos = {
  "1": {
    id: "1",
    pet: "1",
    url:
      "https://athenae25.files.wordpress.com/2016/09/tumblr_lv8pshmnui1qghg8fo1_500.jpg"
  },
  "2": {
    id: "2",
    pet: "3",
    url:
      "https://vignette.wikia.nocookie.net/bttf/images/3/3a/EinsteinMall.jpg/revision/latest?cb=20151213065933"
  },
  "3": {
    id: "3",
    pet: "1",
    url:
      "http://www.cinemacats.com/wp-content/uploads/movies/startrekgenerations02.jpg"
  },
  "4": {
    id: "4",
    pet: "3",
    url:
      "https://i.pinimg.com/originals/73/2f/ac/732fac029f9700c94c1efa1702d7e433.jpg"
  },
  "5": {
    id: "5",
    pet: "1",
    url:
      "https://www.google.com/url?sa=i&source=imgres&cd=&cad=rja&uact=8&ved=2ahUKEwjNvI61zKHgAhUQo4MKHXyQCOoQjRx6BAgBEAU&url=https%3A%2F%2Fwww.pinterest.com%2Fpin%2F34269647143015405%2F&psig=AOvVaw0vrQp7MZWFfroWxYGU8RPM&ust=1549353155472145"
  },
  "6": {
    id: "6",
    pet: "3",
    url:
      "http://images6.fanpop.com/image/photos/40900000/Marty-Einstein-and-DeLorean-Next-To-DeLorean-In-Front-Of-A-Hill-Valley-Courthouse-Mall-back-to-the-future-40901574-421-500.jpg"
  },
  "7": {
    id: "7",
    pet: "2",
    url:
      "https://vignette.wikia.nocookie.net/tardis/images/a/a0/K9_in_the_TARDIS.jpg/revision/latest?cb=20130701231916"
  },
  "8": {
    id: "8",
    pet: "2",
    url: "http://i13.photobucket.com/albums/a293/toolbox1234/K9_05.jpg"
  },
  "9": {
    id: "9",
    pet: "2",
    url:
      "http://www.thedoctorwhosite.co.uk/wp-images/k9/characters/k9-cover.jpg"
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
    photoGallery: (user, _, { headers }) => {
      // if the USER_ID header is not the same ID as the user
      if (user.id !== headers.USER_ID) {
        throw new Error("Sorry, you cannot view someone else's photo gallery.");
      }

      // the current user can see this user's photo gallery
      return root.photoGallery.map(id => photos[id]);
    }
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
