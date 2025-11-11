
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLID,
  GraphQLList,
  GraphQLInt,
} from "graphql";
import { userTypes } from "./user.type";
import  UserService  from "../user.service";
import { log } from "node:console";
import { CustomError } from "../../../utils/classErrorHandling";
import { createUserArgs, userArgs } from "./user.args";
 
  
class UserFields {

constructor(){}

Query= ()=>{
    return {
           hello: {
          type: new GraphQLNonNull(GraphQLString),
          resolve: (): string => "Hello, GraphQL!",
        },
        sayhi: {
          type: new GraphQLNonNull(GraphQLString),
          resolve: (): string => "hi GraphQL!",
        },
        getOneUser: {
          type: userTypes,
          // args: userArgs,
          resolve:UserService.getOneuser
      },getAllUsers: {
        type: new GraphQLList(userTypes),
        resolve:UserService.getAllUsers,
      },
    }
}
mutation=()=>{
    return {

  createUser: {
          type: userTypes,
          args:createUserArgs,
          resolve:UserService.createUser

    }
  }
}
}
export default new UserFields();