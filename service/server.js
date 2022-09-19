import express from "express";
import helmet from "helmet";
import dotenv from "dotenv";

import { v1 } from "#routes/index";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

/*------------- Security Config -------------*/

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());

/*------------- User Service Endpoints -------------*/

// Example router
app.use("/user", v1.UserRouter);

/*------------- Error middleware -------------*/

// app.use(errorHandler); // TODO: Create error handler

app.listen(PORT, () => {
  console.log(`User Server listening on port ${PORT}`);
});
