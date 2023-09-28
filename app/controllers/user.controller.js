const db = require("../models");
const { v4: uuidv4 } = require('uuid');
const { ObjectId } = require('mongodb');

const User = db.user;

// Create and Save a new  User
exports.create = (req, res) => {
  // Validate request

  // All User logins with emailId
  if (!req.body.password || !req.body.emailId || !req.body.role) {
    res.status(400).send({ message: "Mandatory fields cannot be empty!" });
    return;
  }

  // Create a  User
  const user = new User({
    emailId: req.body.emailId,
    phoneNumber: req.body.phoneNumber,
    firstName: req.body.firstName,
    address: req.body.address,
    lastName: req.body.lastName,
    dob: req.body.dob,
    creditScore: req.body.creditScore,
    password: req.body.password,
    sourceOfIncome: req.body.sourceOfIncome,
    workRole: req.body.workRole,
    salary: req.body.salary,
    idNumber: req.body.idNumber,
    role: req.body.role
  });

  // Save User in the database
  user
    .save(user)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the  User."
      });
    });
};

// Retrieve all Users from the database.
exports.findAll = (req, res) => {
  // const title = req.query.title;
  // var condition = title ? { title: { $regex: new RegExp(title), $options: "i" } } : {};

  User.find({ role: ["borrower", "lender"] })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Users."
      });
    });
};

// Find a single User with an EmailId
exports.findOneByEmail = (req, res) => {
  const { emailId } = req.query;

  User.findOne({ emailId })
    .then(data => {
      if (!data)
        res.status(404).send({ message: "Not found  User with id " + emailId });
      else res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: "Error retrieving  User with id=" + emailId });
    });
};

// Update a  User by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }

  const id = req.params.id;

  User.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update  User with id=${id}. Maybe  User was not found!`
        });
      } else res.send({ message: " User was updated successfully." });
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating  User with id=" + id
      });
    });
};

// Update a Multiple Users
exports.updateBulk = async (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }


  User.bulkWrite(req.body.map(userObj => ({
    updateOne: {
      filter: { _id: ObjectId(userObj.id) },
      update: userObj,
      upsert: true,
    }
  }))).then(data => {
    if (!data) {
      res.status(404).send({
        message: `Cannot update users!`
      });
    } else res.send({ message: "Users updated successfully." });
  })

};

// Delete a  User with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  User.findByIdAndRemove(id, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete  User with id=${id}. Maybe  User was not found!`
        });
      } else {
        res.send({
          message: " User was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete  User with id=" + id
      });
    });
};

// Delete all Users from the database.
exports.deleteAll = (req, res) => {
  User.deleteMany({})
    .then(data => {
      res.send({
        message: `${data.deletedCount} Users were deleted successfully!`
      });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all Users."
      });
    });
};

// Find all Borrowers Users
exports.findAllBorrowers = (req, res) => {
  const role = req.query.role;
  User.find({ role })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Users."
      });
    });
};

// Find all Lenders Users
exports.findAllLenders = (req, res) => {
  User.find({ role: "lender" })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Users."
      });
    });
};
