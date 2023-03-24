const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");

// middleware
module.exports = (app) =>
  app
    .use(logger("dev"))
    .use(cookieParser())
    .use(cors({ origin: "*", methods: "GET,HEAD,PUT,PATCH,POST,DELETE" }))
    .use((err, req, res, next) => {
      if (err.status === 400 && err instanceof SyntaxError && "body" in err) {
        return res.status(400).send({ error: "Invalid Request body" });
      }
      next();
    });
