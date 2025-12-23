import express from "express";
import config from "../src/configs/env.config";
import dbConnection from "../src/configs/db.config";
const app = express();
await dbConnection();

// Middlewares
app.use(express.json());

import userRoutes from "./routes/user.route";
app.use("/api/v1/", userRoutes);

// Routes

app.listen(config.port, () => {
  console.log(`server run in port ${config.port}`);
});
