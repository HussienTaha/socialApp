import {
  GraphQLSchema,
  GraphQLObjectType,

} from "graphql";
import { createHandler } from "graphql-http/lib/use/express";
import { CustomError } from "../../utils/classErrorHandling";
import UserFields from "../users/graphql/user.fields";
import PostFields from "../post/graphql/post.felids";
  export const Schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: "Query",
      description: "Root query",
      fields: {
     ...UserFields.Query(),
     ...PostFields.Query()
      },
    }),
    mutation: new GraphQLObjectType({
      name: "Mutation",
      description: "Root mutation",
      fields: {
      ...UserFields.mutation()
      },
    }),
  });