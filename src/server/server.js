const Exclusive = require("exclusivejs").instance();
const middleware = require("../utils/middleware");
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
    .setApiPrefix("api/v1");

  await server.init();
}

BootStrap();
