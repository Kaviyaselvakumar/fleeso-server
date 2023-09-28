module.exports = mongoose => {
  const LoanStatus = Object.freeze({
    approved: 'approved',
    rejected: 'rejected',
    created: 'created',
  });
  const RepaySchedule = mongoose.Schema({ dueDate: Date, amount: String, status: String });

  var schema = mongoose.Schema(
    {
      creationDate: Date,
      approvedBy: String,
      approvalDate: Date,
      status: {
        type: String,
        enum: Object.values(LoanStatus),
      },
      phoneNumber: String,
      emailId: String,
      idNumber: String,
      userName: String,
      dob: Date,
      creditScore: String,
      amount: String,
      sourceOfIncome: String,
      repaymentMonths: Number,
      emiPerMonth: String,
      repaySchedule: [RepaySchedule],
      loanNumber: String,
    }
  );

  schema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const Loan = mongoose.model("loan", schema);
  return Loan;
};
