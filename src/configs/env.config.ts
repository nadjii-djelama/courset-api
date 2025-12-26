import dotenv from "dotenv";
dotenv.config();

interface Appconfig {
  PORT: number;
  MONGO_URI: string;
  JWT_SECRET: string;
  NODE_ENV: string;
  // arcjet_secret: string;
}

const config: Appconfig = {
  PORT: Number(process.env.PORT) || 4000,
  MONGO_URI: process.env.MONGODB_URI || "",
  JWT_SECRET: process.env.JWT_SECRET || "The default secret key",
  NODE_ENV: process.env.NODE_ENV || "development",
};

export default config;
