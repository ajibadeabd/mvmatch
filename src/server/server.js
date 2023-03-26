const Exclusive = require("exclusivejs").instance();
const middleware = require("../utils/middleware");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../../swagger.json");
let validator = require("../app/helpers/validator/index");
async function BootStrap() {
  const server = Exclusive.setConfig()
    .setRoutePath("src/app/routes")
    .setMiddleware(middleware)
    .setValidator(validator)
    .injectDatabase({
      type: "mongodb",
      databaseUrl: process.env.DATABASE_URL,
      orm: "mongoose",
    })
    .setApiPrefix("api/v1")
    .connectDocumentation(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument)
    );

  return await server.init();
}

module.exports = BootStrap();
