const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const express = require("express");

// middleware
module.exports = (app) =>
  app
    .use(logger("dev"))
    .use(cookieParser())
    .use(cors({ origin: "*", methods: "GET,HEAD,PUT,PATCH,POST,DELETE" }))
    .get("/", (req, res) => {
      return res.send(
        '<h1><a href="/api-docs">link</> to view documentation<h1>'
      );
    })
    .use(express.json()) // add body parsing middleware
    .use(express.urlencoded({ extended: true })) // add body parsing middleware
    .use((err, req, res, next) => {
      if (err.status === 400 && err instanceof SyntaxError && "body" in err) {
        return res.status(400).send({ error: "Invalid Request body" });
      }
      next();
    });
