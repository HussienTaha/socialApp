import {resolve} from "path";
import { config } from "dotenv";
config({ path: resolve('./config/.env') });
import chalk from "chalk";
import express,{Request, Response , NextFunction} from "express";
import  Cors  from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { CustomError } from "./utils/classErrorHandling";
import userRouter from "./modules/users/user.controller";
import connrectionDB from "./DB/connetionDB";
import connectionDB from "./DB/connetionDB";
const app: express.Application = express();
const port: string | number =process.env.PORT || 5000;

const limiter = rateLimit({
        windowMs: 5 * 60 * 1000, // 5 minutes
        max: 20,
        message: 'Too many requests from this IP, please try again after an 5 minute wait' ,// limit each IP to 100 requests per windowMs
        statusCode: 429, // 429 status = Too Many Requests 
       legacyHeaders: false // Disable the `X-RateLimit-*` headers
    })



const bootstrap = () => {
app.use(express.json());
app.use(Cors());
app.use(helmet());
app.use(morgan("combined"));
app.use(limiter);
app.use("/users",userRouter)

app.get("/", (req:Request, res:Response , next:NextFunction) => {
    res.status(200).json({message: "Server is up and running ❤️👌"})
})

   connectionDB();

app.use("{/*demo}", (req:Request, res:Response , next:NextFunction) => {
    throw new  CustomError(` invalid Url ${req.originalUrl}`, 404);
})
// Global Error Handler
app.use((err:CustomError, req:Request, res:Response , next:NextFunction) => {
    console.error(err.stack);
    res.status(err.statuscode as unknown as number || 500).json({message: err.message, stack: err.stack});
})

    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });

}
export default bootstrap;