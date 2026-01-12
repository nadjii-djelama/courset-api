import express, { urlencoded } from "express";
import config from "./configs/env.config.js";
import dbConnection from "./configs/db.config.js";
import { redisServer } from "./configs/redis.config.js";
const app = express();

import userRoute from "./routes/user.route.js";
import courseRoute from "./routes/course.route.js";

// Middlewares
app.use(express.json());
app.use(urlencoded({ extended: true }));

app.use("/api/v1", userRoute);
app.use("/api/v1", courseRoute);

// Routes

const startServer = async () => {
  try {
    await dbConnection();
    // await redisServer();

    app.listen(config.PORT, () => {
      console.log(`✅ server run in port ${config.PORT}`);
    });
  } catch (err: any) {
    console.log(`❌ ${err.message}`);
  }
};
if (process.env.NODE_ENV !== "test") {
  startServer();
}

export default app;
