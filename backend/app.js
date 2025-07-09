require("dotenv").config();
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./swagger");
const flightsRouter = require("./routes/flights");
const bodyParser = require("body-parser");
const bookingsRouter = require("./routes/bookings");
const adminRouter = require("./routes/admin");
const sseRouter = require("./routes/sse");
const errorHandler = require("./middleware/errorHandler");
const loggerMiddleware = require("./middleware/logger");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:3001",
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(loggerMiddleware);

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/flights", flightsRouter);
app.use("/bookings", bookingsRouter);
app.use("/admin", adminRouter);
app.use("/sse", sseRouter);

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use(errorHandler);

module.exports = app;
