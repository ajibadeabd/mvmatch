const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    cost: {
      type: Number,
      required: true,
      validate: {
        validator: function (v) {
          return v % 5 === 0; // cost should be in multiples of 5
        },
        message: "Cost should be in multiples of 5",
      },
    },
    productName: { type: String, required: true },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
