module.exports = mongoose => {
  const UserRole = Object.freeze({
    borrower: 'borrower',
    lender: 'lender',
    admin: 'admin',
  });
  var schema = mongoose.Schema(
    {
      emailId: String,
      userId: String,
      phoneNumber: String,
      firstName: String,
      address: String,
      lastName: String,
      dob: Date,
      inFirebase: Boolean,
      creditScore: String,
      password: String,
      sourceOfIncome: String,
      workRole: String,
      salary: String,
      idNumber: String,
      role: {
        type: String,
        enum: Object.values(UserRole),
      }
    }
  );

  schema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const User = mongoose.model("user", schema);
  return User;
};
