const db = require("../models");
const { v4: uuidv4 } = require('uuid');
const Loan = db.loans;

const User = db.user;
// Create and Save a new Loan
exports.create = (req, res) => {
  // Validate request

  // Borrrower logins with phoneNumber
  // Lender login with emailId
  if (!req.body.phoneNumber || !req.body.dob || !req.body.amount || !req.body.emailId || !req.body.idNumber) {
    res.status(400).send({ message: "Mandatory fields cannot be empty!" });
    return;
  }

  // Create a Loan
  const loan = new Loan({
    creationDate: req.body.creationDate,
    approvedBy: null,
    approvalDate: null,
    status: "created",
    phoneNumber: req.body.phoneNumber,
    emailId: req.body.emailId,
    idNumber: req.body.idNumber,
    userName: req.body.userName,
    dob: req.body.dob,
    amount: req.body.amount,
    emiPerMonth: req.body.emiPerMonth,
    repaymentMonths: req.body.repaymentMonths,
    sourceOfIncome: req.body.sourceOfIncome,
    repaySchedule: req.body.repaySchedule,
    loanNumber: uuidv4(),
  });

  if (loan.emailId) {
    User.findOne({ emailId:loan.emailId })
      .then(data => {
        if (data) {
          data["idNumber"] = data["idNumber"] ? data["idNumber"] : loan["idNumber"];
          data["phoneNumber"] = data["phoneNumber"] ? data["phoneNumber"] : loan["phoneNumber"];
          data["dob"] = data["dob"] ? data["dob"] : loan["dob"];
          data["creditScore"] = data["creditScore"] ? data["creditScore"] : loan["creditScore"];
          data["sourceOfIncome"] = data["sourceOfIncome"] ? data["sourceOfIncome"] : loan["sourceOfIncome"];

          User.findByIdAndUpdate(data.id, data, { useFindAndModify: false })
            .then(data => {
              if(data){
                console.log("Updated user's essential Information");
              }
            })
        }
      })
  }

  // Save Loan in the database
  loan
    .save(loan)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Loan."
      });
    });
};

// Retrieve all Loans from the database.
exports.findAll = (req, res) => {
  const title = req.query.title;
  var condition = title ? { title: { $regex: new RegExp(title), $options: "i" } } : {};

  Loan.find(condition)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving loans."
      });
    });
};

// Find a single Loan with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Loan.findById(id)
    .then(data => {
      if (!data)
        res.status(404).send({ message: "Not found Loan with id " + id });
      else res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: "Error retrieving Loan with id=" + id });
    });
};

// Update a Loan by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }

  const id = req.params.id;

  Loan.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update Loan with id=${id}. Maybe Loan was not found!`
        });
      } else res.send({ message: "Loan was updated successfully." });
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Loan with id=" + id
      });
    });
};

// Delete a Loan with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Loan.findByIdAndRemove(id, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete Loan with id=${id}. Maybe Loan was not found!`
        });
      } else {
        res.send({
          message: "Loan was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Loan with id=" + id
      });
    });
};

// Delete all Loans from the database.
exports.deleteAll = (req, res) => {
  Loan.deleteMany({})
    .then(data => {
      res.send({
        message: `${data.deletedCount} Loans were deleted successfully!`
      });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all loans."
      });
    });
};

// Find all Borrowers Loans
exports.findAllBorrowers = (req, res) => {
  const emailId = req.query.emailId;
  Loan.find({ status: ["approved", "rejected"], emailId })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving loans."
      });
    });
};

// Find all Lenders Loans
exports.findAllCreatedLoans = (req, res) => {
  Loan.find({ status: ["created"] })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving loans."
      });
    });
};
