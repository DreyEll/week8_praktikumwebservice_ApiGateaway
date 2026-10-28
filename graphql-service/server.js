const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLList
} = require("graphql");

const app = express();

const PORT = 8080;

// Data contoh service
const lagu = [
  {
    id: 1,
    judul: "bad",
    album_id: 1
  },
  {
    id: 2,
    judul: "peach eyes",
    album_id: 1
  },
  {
    id: 3,
    judul: "midnight",
    album_id: 2
  }
];

const LaguType = new GraphQLObjectType({
  name: "Lagu",

  fields: {
    id: {
      type: GraphQLInt
    },

    judul: {
      type: GraphQLString
    },

    album_id: {
      type: GraphQLInt
    }
  }
});

const QueryType = new GraphQLObjectType({
  name: "Query",

  fields: {
    lagu: {
      type: new GraphQLList(LaguType),

      resolve: () => {
        return lagu;
      }
    }
  }
});

const schema = new GraphQLSchema({
  query: QueryType
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "graphql-service"
  });
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    graphiql: true
  })
);

app.listen(PORT, () => {
  console.log(`GraphQL Service berjalan di http://localhost:${PORT}`);
  console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
});