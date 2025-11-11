import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLID,
  GraphQLList,
  GraphQLInt,
} from "graphql";

export const userTypes = new GraphQLObjectType({
  name: "user",
  fields: () => ({
    _id: { type: GraphQLID },
    fName: { type: GraphQLString },
    lName: { type: GraphQLString },
    email: { type: GraphQLString },
    password: { type: GraphQLString },
    age: { type: GraphQLInt },
    friends: {
      type: new GraphQLList(GraphQLID),
    },
    address: { type: new GraphQLNonNull(GraphQLString) },
    role: { type: new GraphQLNonNull(GraphQLString) },
    phone: { type: new GraphQLNonNull(GraphQLString) },
    //   wife:{
    //     type: new GraphQLObjectType({
    //       name: "wife",
    //       fields: () => ({
    //         name: { type: GraphQLString },
    //         age: { type: GraphQLInt },
    //       }),
    //     }),
    // }
  }),
});
