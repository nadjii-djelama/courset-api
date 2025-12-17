import dotenv from "dotenv";
dotenv.config();

interface Appconfig {
  port: number;
  mongo_uri: string;
  jwt_secret: string;
  node_env: string;
  // arcjet_secret: string;
}

const config: Appconfig = {
  port: Number(process.env.PORT) || 4000,
  mongo_uri: process.env.MONGODB_URI!,
  jwt_secret: process.env.JWT_SECRET!,
  node_env: process.env.NODE_ENV!,
};

export default config;
