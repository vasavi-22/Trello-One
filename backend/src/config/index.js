import dotenv from "dotenv";
dotenv.config();

export const config = {
    DATABASE : process.env.MONGO_URI,
    PORT : process.env.PORT
};