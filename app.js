const express = require("express");
const app = express();

const dramaRouter = require("./routes/dramaRoutes");
const userRouter = require("./routes/userRoutes");
const commentRouter = require("./routes/commentRoutes");
const recommendationRouter = require("./routes/recommendationRoute");
const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");

const cors = require("cors");

app.use(
  cors({
    "Access-Control-Allow-Origin": "*",
  })
);

app.use(express.json());

app.use((req, res, next) => {
  next();
});

app.use("/api/v1/dramas", dramaRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/recommendations", recommendationRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find this route ${req.url} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
