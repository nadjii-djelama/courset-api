import dotenv from "dotenv";
dotenv.config();

interface Appconfig {
  port: number;
  mongo_uri: string;
  jwt_secret: string;
  // arcjet_secret: string;
}

const config: Appconfig = {
  port: Number(process.env.PORT) || 4000,
  mongo_uri: process.env.MONGODB_URI!,
  jwt_secret: process.env.JWT_SECRET!,
};

export default config;
