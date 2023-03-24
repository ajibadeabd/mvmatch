const mongoose = require("mongoose");

// define account schema
const AccountSchema = new mongoose.Schema(
  {
    balance: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Account = mongoose.model("Account", AccountSchema);
module.exports = Account;
