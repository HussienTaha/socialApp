
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLID,
  GraphQLList,
  GraphQLInt,
} from "graphql";
import postService from "../post.service";
import { postType } from "./post.typs";

class PostFields {

constructor(){}

Query= ()=>{
    return {
getAllPosts: {
        type: new GraphQLList(postType),
        resolve:postService.getAllpostsgQL,
      },
    }
}
mutation=()=>{
    return {

//   createUser: {
//           type: userTypes,
//           args:createUserArgs,
//           resolve:UserService.createUser

//     }
  }
}
}
export default new PostFields();