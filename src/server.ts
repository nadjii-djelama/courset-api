import express, { urlencoded } from "express";
import config from "./configs/env.config.js";
import dbConnection from "./configs/db.config.js";
const app = express();

import userRoutes from "./routes/user.route.js";

// Middlewares
app.use(express.json());
app.use(urlencoded({ extended: true }));

app.use("/api/v1", userRoutes);

// Routes

const startServer = async () => {
  try {
    await dbConnection();

    app.listen(config.PORT, () => {
      console.log(`server run in port ${config.PORT}`);
    });
  } catch (err: any) {
    console.log(err.message);
  }
};
startServer();
