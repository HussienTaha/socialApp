import chalk from "chalk";
import mongoose from "mongoose";
const connectionDB= async ()=>{
try {
        await mongoose.connect(process.env.DB_URL as unknown as string);
        console.log(chalk.bgGreen.bold.blue("Success to  Connect to DB👌❤️ "));

    } catch (error) {
        console.error(chalk.red("Error connecting to MongoDB: 😒😒", error));
    }



}
export default connectionDB