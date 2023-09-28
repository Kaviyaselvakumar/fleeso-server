module.exports = app => {
  const user = require("../controllers/user.controller.js");

  var router = require("express").Router();

  // Create a new User
  router.post("/", user.create);

  // Retrieve all user
  router.get("/", user.findAll);

  // Retrieve all borrowers
  router.get("/lenders", user.findAllLenders);

  // Retrieve a single User with emailId
  router.get("/email/", user.findOneByEmail);

  // // Update a User with id
  // router.put("/:id", user.update);

  // Update a List of Users
  router.put("/bulk", user.updateBulk);

  // Delete a User with id
  router.delete("/:id", user.delete);

  app.use("/api/user", router);
};
