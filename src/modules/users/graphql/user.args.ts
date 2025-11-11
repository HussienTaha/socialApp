import { GraphQLID, GraphQLNonNull, GraphQLString } from "graphql";
import fr from "zod/v4/locales/fr.js";

export const userArgs = {
  id: {
    type: new GraphQLNonNull(GraphQLID),
  },
};
export const createUserArgs = {
  fName: { type: new GraphQLNonNull(GraphQLString) },
  lName: { type: new GraphQLNonNull(GraphQLString) },
  age: { type: new GraphQLNonNull(GraphQLString) },
  email: { type: new GraphQLNonNull(GraphQLString) },
  password: { type: new GraphQLNonNull(GraphQLString) },
  address: { type: new GraphQLNonNull(GraphQLString) },
  phone: { type: new GraphQLNonNull(GraphQLString) },
};
