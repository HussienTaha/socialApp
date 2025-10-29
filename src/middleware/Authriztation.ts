import { NextFunction, Request, Response } from "express";
import { RoleType } from "../DB/models/user.model";
import { CustomError } from "../utils/classErrorHandling";

export const Authriztation = ({accessrole =[]}: { accessrole: RoleType[]}) => {
    return (req: Request, res:Response, next: NextFunction) => {
if (!accessrole.includes(req.user?.role as RoleType)) {
    throw new CustomError("unauthorized", 401);
}
next();
    };
}