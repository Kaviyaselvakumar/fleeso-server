module.exports = mongoose => {
  const LoanStatus = Object.freeze({
    approved: 'approved',
    rejected: 'rejected',
    created: 'created',
  });
  const RepaySchedule = mongoose.Schema({ dueDate: Date, amount: String, status: String });
  const Chat = mongoose.Schema({ id: String, msg:String, createdOn: Date, user: String, userType: String });

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
      firstName: String,
      dob: Date,
      creditScore: String,
      amount: String,
      sourceOfIncome: String,
      repaymentMonths: Number,
      emiPerMonth: String,
      isAutoApproved: Boolean,
      repaySchedule: [RepaySchedule],
      loanNumber: String,
      chat: [Chat]
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
