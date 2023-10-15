module.exports = app => {
  const payment = require("../controllers/payment.controller.js");

  var router = require("express").Router();

  // Create a new payment
  router.post("/", payment.pay);
  router.get("/key", payment.key);

  app.use("/api/payments", router);
};
