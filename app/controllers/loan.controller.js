const { parseISO, differenceInYears, format, set, addMonths } = require("date-fns");
const db = require("../models");
const { v4: uuidv4 } = require('uuid');
const Loan = db.loans;

const User = db.user;

const getAge = (dob) => differenceInYears(new Date(), new Date(dob));

const buildNextPaymentDates = (activeLoan) => {
  const paymentDateList = [];
  let { repaymentMonths } = activeLoan;
  let paymentDate = format(new Date(), "MM/dd/yyyy");
  for (var i = 0; i < repaymentMonths; i++) {
    paymentDate = format(set(addMonths(new Date(paymentDate), 1), { date: 5 }), "MM/dd/yyyy");
    paymentDateList.push({ dueDate: paymentDate, status: "unpaid", amount: activeLoan.emiPerMonth });
  }
  return paymentDateList;
}


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
    firstName: req.body.firstName,
    creditScore: req.body.creditScore,
    dob: req.body.dob,
    amount: req.body.amount,
    emiPerMonth: req.body.emiPerMonth,
    repaymentMonths: req.body.repaymentMonths,
    sourceOfIncome: req.body.sourceOfIncome,
    repaySchedule: req.body.repaySchedule,
    gender: req.body.gender,
    address: req.body.address,
    monthlyIncome: req.body.monthlyIncome,
    loanType: req.body.loanType,
    loanNumber: uuidv4()
  });

  // Auto Approved if user has creditScore 850 and Age less than 28
  // which indicates, he has more chances to repay the loan.
  if (parseInt(loan.creditScore) > 850 && getAge(loan.dob) < 28) {
    loan['isAutoApproved'] = true;
    loan['status'] = "approved";
    loan['approvedBy'] = "system";
    loan['approvalDate'] = new Date();
  }

  // Prefill RepaySchedule in case of auto approved loan
  if (loan.repaySchedule == null || (loan.repaySchedule != null && loan.repaySchedule.length === 0) && loan.status === 'approved') {
    loan.repaySchedule = buildNextPaymentDates(loan);
  }
  if (loan.emailId) {
    User.findOne({ emailId: loan.emailId })
      .then(data => {
        if (data) {
          data["idNumber"] = data["idNumber"] ? data["idNumber"] : loan["idNumber"];
          data["phoneNumber"] = data["phoneNumber"] ? data["phoneNumber"] : loan["phoneNumber"];
          data["dob"] = data["dob"] ? data["dob"] : loan["dob"];
          data["creditScore"] = data["creditScore"] ? data["creditScore"] : loan["creditScore"];
          data["sourceOfIncome"] = data["sourceOfIncome"] ? data["sourceOfIncome"] : loan["sourceOfIncome"];
          data["firstName"] = data["firstName"] ? data["firstName"] : loan["firstName"];
          data["gender"] = data["gender"] ? data["gender"] : loan["gender"];
          data["address"] = data["address"] ? data["address"] : loan["address"];
          data["salary"] = data["monthlyIncome"] ? data["monthlyIncome"] : loan["monthlyIncome"];
          data["loanType"] = data["loanType"] ? data["loanType"] : loan["loanType"];
          User.findByIdAndUpdate(data.id, data, { useFindAndModify: false })
            .then(data => {
              if (data) {
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
  Loan.find({ status: ["approved", "rejected", "closed"], emailId })
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

const isPaymentNeeded = (activeLoan) => {
  return activeLoan && activeLoan.repaySchedule && activeLoan.repaySchedule.filter(r => r.status === "unpaid").length > 0;
}

exports.payLoan = async (req, res) => {
  const loanNumber = req.query.loanNumber;
  Loan.findOne({ loanNumber })
    .then(loan => {
      if (loan != null) {
        if (!loan.repaySchedule || loan.repaySchedule.length === 0 || isPaymentNeeded(loan)) {
          let firstUnPaidIndex = loan.repaySchedule.findIndex(x => x.status === "unpaid");

          if (firstUnPaidIndex !== -1) {
            loan.repaySchedule[firstUnPaidIndex].paymentDate = format(new Date(), "MM/dd/yyyy");
            loan.repaySchedule[firstUnPaidIndex].status = "paid";
            loan.repaySchedule[firstUnPaidIndex].amount = parseFloat(loan.emiPerMonth);
          }

          if (!isPaymentNeeded(loan)) {
            loan.status = "closed";
            const convo = {
              createdOn: new Date(),
              user: "System",
              msg: "Congratulations on closing your loan, Thanks for banking with us",
              userType: "lender"
            }
            if (loan.chat) {
              loan.chat.push(convo);
            } else {
              loan.chat = [convo];
            }
          }
          Loan.findByIdAndUpdate(loan._id, loan, { useFindAndModify: false })
            .then(data => {
              if (!data) {
                res.status(404).send({
                  message: `Cannot update Loan with id=${loan._id}. Maybe Loan was not found!`
                });
              } else
                res.send({ loan, message: "EMI Paid Successfully" });
            })
            .catch(err => {
              res.status(500).send({
                message: "Error updating Loan with id=" + loan._id
              });
            });
        } else {
          console.log("Loan Closed");
          res.send({ loan: null, message: "Loan Closed already" });
        }
      }
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving loans."
      });
    });
}
