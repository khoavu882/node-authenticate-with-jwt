const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const middlewares = require("./middlewares/logger");

require("dotenv").config();

const app = express();

const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;
const ORIGIN_URL = process.env.ORIGIN_URL;

app.use(bodyParser.json());
app.use(morgan("common"));
app.use(helmet());
app.use(
  cors({
    origin: ORIGIN_URL,
  })
);

mongoose
  .connect(MONGO_URL, {
    useCreateIndex: true,
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

// Models
require("./models/user");

//Routes
const usersRoute = require("./routes/users");

app.use(usersRoute);

// Middlewares
app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

app.listen(PORT, () => {
  console.log("Server is running on port :", PORT);
});
