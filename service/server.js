import express from "express";
import helmet from "helmet";
import dotenv from "dotenv";

import v1 from "#routes/index";
import middleware from "#middlewares/index";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

/*------------- Security Config -------------*/

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());

/*------------- Client Service Endpoints -------------*/

app.use("/client/v1/client", v1.ClientRouter);
app.use("/client/v1/consultation", v1.ConsultationRouter);
app.use("/client/v1/mood-tracker", v1.MoodTrackerRouter);
app.use("/client/v1/my-qa", v1.MyQARouter);
app.use("/client/v1/organization", v1.OrganizationRouter);

/*------------- Error middleware -------------*/

app.use(middleware.errorMiddleware.notFound);
app.use(middleware.errorMiddleware.errorHandler);

app.listen(PORT, () => {
  console.log(`Client Server listening on port ${PORT}`);
});
