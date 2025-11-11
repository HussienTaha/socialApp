import { NextFunction, Request, Response } from "express";
import { RoleType } from "../DB/models/user.model";
import { CustomError } from "../utils/classErrorHandling";
import { GraphQLError } from "graphql";

export const Authriztation = ({accessrole =[]}: { accessrole: RoleType[]}) => {
    return (req: Request, res:Response, next: NextFunction) => {
if (!accessrole.includes(req.user?.role as RoleType)) {
    throw new CustomError("unauthorized", 401);
}
next();
    };
}


export const AuthorizationGQL = async ({
  accessRoles = [],
  role,
}: {
  accessRoles: RoleType[];
  role: RoleType;
}) => {
  if (!accessRoles.includes(role)) {
    throw new GraphQLError("unauthorized", {
      extensions: { code: "UNAUTHORIZED", statusCode: 401 },
    });
  }

  return true;
};