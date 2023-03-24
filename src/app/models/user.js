const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    sessions: { type: Array },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
    role: { type: String, enum: ["seller", "buyer"], default: "buyer" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(user.password, salt);
  user.password = hash;
  next();
});

userSchema.pre("findOneAndUpdate", async function (next) {
  if (this._update.password) {
    this._update.password = bcrypt.hashSync(this._update.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};
const User = mongoose.model("User", userSchema);

module.exports = User;
