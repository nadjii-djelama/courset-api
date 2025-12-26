import express from "express";
import config from "./configs/env.config.js";
import dbConnection from "./configs/db.config.js";
const app = express();
await dbConnection();

// Middlewares
app.use(express.json());

import userRoutes from "./routes/user.route.js";
app.use("/api/v1/", userRoutes);

// Routes

app.listen(config.PORT, () => {
  console.log(`server run in port ${config.PORT}`);
});
