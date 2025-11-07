import { resolve } from "path";
import { config } from "dotenv";
config({ path: resolve("./config/.env") });
import express, { Request, Response, NextFunction } from "express";
import Cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { CustomError } from "./utils/classErrorHandling";
import userRouter from "./modules/users/user.controller";
import connectionDB from "./DB/connetionDB";
import {
  creartUplodeFilePresigneUrl,
  deleteFile,
  deletefiles,
  getAllFiles,
  gitFile,
} from "./utils/s3config";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import postRouter from "./modules/post/post.controller";
import commentRouter from "./modules/comment/comment.controller";
import { Server, Socket } from "socket.io";
import {
  decodedTokenAndfitchUser,
  getsegnature,
  TokenType,
} from "./utils/token";
import { HydratedDocument } from "mongoose";
import { IUser } from "./DB/models/user.model";
import { JwtPayload } from "jsonwebtoken";
import { inilalizationIo } from "./modules/gateway/gateway";
import chatRouter from "./modules/chat/chat.controller";
const pipelineAsync = promisify(pipeline);
const app: express.Application = express();
const port: string | number = process.env.PORT || 5000;
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 200,
  message:
    "Too many requests from this IP, please try again after an 5 minute wait", // limit each IP to 100 requests per windowMs
  statusCode: 429, // 429 status = Too Many Requests
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});



app.get(
  "/uplode/presignedUrl/*path",
  async (req: Request, res: Response, next: NextFunction) => {
    const { path } = req.params as unknown as { path: string[] };

    const Key = path.join("/");
    console.log(Key);

    const url = await creartUplodeFilePresigneUrl({ Key });

    return res.status(200).json({ message: "success", url });
  }
);
app.get(
  "/gitfiles",
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await getAllFiles({ path: "users" });

    return res
      .status(200)
      .json({ message: "success getAllFiles ❤️👌", result });
  }
);
app.get(
  "/delete/*path",
  async (req: Request, res: Response, next: NextFunction) => {
    const { path } = req.params as unknown as { path: string[] };

    const Key = path.join("/");

    const result = await deleteFile({ Key });

    return res
      .status(200)
      .json({ message: "success delete file ❤️👌", result });
  }
);
app.get(
  "/deletefiles",
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await deletefiles({
      urls: [
        "socailMediaApp/users68dd85a31b297aac06bc5850/094ce9af-4f65-4fc7-91e8-2c8d442c07db_Screenshot 2025-10-10 232739.png",
        "socailMediaApp/users68dd85a31b297aac06bc5850/50d5fc78-4acf-478b-b3ed-f54255fb1972_Screenshot 2025-10-10 232739.png",
        "socailMediaApp/users68dd85a31b297aac06bc5850/77a82f0d-cdd2-4f50-9ce6-31de5c1c0cb0_Screenshot 2025-10-10 232739.png",
        "socailMediaApp/users68dd85a31b297aac06bc5850/ad005e1d-aff7-4085-93b6-34029b5cc5fb_Screenshot 2025-10-10 232739.png",
        "socailMediaApp/users68dd85a31b297aac06bc5850/e7711965-a5ec-4b58-a8d1-5e44dde81ce3_user.jpg",
      ],
    });

    return res
      .status(200)
      .json({ message: "success delete files ❤️👌", result });
  }
);
app.get(
  "/uplode/*path",
  async (req: Request, res: Response, next: NextFunction) => {
    const { path } = req.params as unknown as { path: string[] };

    const Key = path.join("/");

    console.log("Fetching Key:", Key);

    const result = await gitFile({ Key });
    const stream = result.Body as NodeJS.ReadableStream;
    res.set("cross-origin-resource-policy", "cross-origin");
    res.setHeader("Content-Type", result?.ContentType!);

    await pipelineAsync(stream, res);
  }
);
app.get(
  "/downlode/*path",
  async (req: Request, res: Response, next: NextFunction) => {
    const { path } = req.params as unknown as { path: string[] };
    const { downlode } = req.query as unknown as { downlode: string[] };
    console.log(downlode);

    const Key = path.join("/");

    console.log("Fetching Key:", Key);

    const result = await gitFile({ Key });
    const stream = result.Body as NodeJS.ReadableStream;
    res.setHeader("Content-Type", result?.ContentType!);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${downlode || path.join("/").split("/").pop()}"`
    );

    await pipelineAsync(stream, res);
  }
);

const bootstrap = () => {
  app.use(express.json());
  app.use(Cors());
  app.use(helmet());
  app.use(morgan("combined"));
  app.use(limiter);

  app.use("/users", userRouter);
  app.use("/posts", postRouter);
  app.use("/comments", commentRouter);
  app.use("/chat", chatRouter);
  app.get("/", (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ message: "Server is up and running ❤️👌" });
  });

  connectionDB();

  app.use("{/*demo}", (req: Request, res: Response, next: NextFunction) => {
    throw new CustomError(` invalid Url ${req.originalUrl}`, 404);
  });
  // Global Error Handler
  app.use(
    (err: CustomError, req: Request, res: Response, next: NextFunction) => {
      console.error(err.stack);
      res
        .status((err.statuscode as unknown as number) || 500)
        .json({ message: err.message, stack: err.stack });
    }
  );

  const HttpServer = app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
  inilalizationIo(HttpServer);



};
export default bootstrap;
