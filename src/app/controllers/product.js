const ProductSchema = require("../models/product");
const PurchaseSchema = require("../models/purchase");
const UserController = require("./user");

class ProductController {
  #packages;
  #models;
  #services;
  constructor({ packages, models, services }) {
    this.#packages = packages;
    this.#models = models;
    this.#services = services;
  }
  createProduct = async (productDetails, seller) => {
    try {
      // starts a try-catch block to handle errors
      let product = await this.#models.Product.findOne({
        // checks if a product with the same name and sellerId already exists
        productName: productDetails.productName,
        sellerId: seller._id,
      });
      if (product) {
        // if a product already exists, throws an error
        throw "product already added";
      }
      product = await this.#models.Product.create({
        // creates a new product with the given productDetails and sellerId
        ...productDetails,
        sellerId: seller._id,
      });
      return {
        // returns an object with data, status, and message properties
        data: product,
        status: true,
        message: "product created successfully",
      };
    } catch (err) {
      // if an error occurred, returns an object with data, status, and message properties
      return { data: null, status: false, message: err };
    }
  };

  getProducts = async ({ page = 1, limit = 20 }) => {
    // defines a method called getProducts that takes an object with page and limit as optional parameters
    try {
      let product = await this.#models.Product.find() // searches for all products in the database
        .skip((page - 1) * limit) // skips products based on the page number and limit
        .limit(limit); // limits the number of products returned
      return {
        // returns an object with data, status, and message properties
        data: product,
        status: true,
        message: "product fetch successfully",
      };
    } catch (error) {
      // if an error occurred, returns an object with data, status, and error properties
      return { data: null, status: false, error };
    }
  };
  buy = async (userDetails, productDetail, productId) => {
    try {
      // start a new session for the transaction
      const session = await this.#packages.mongoose.startSession();
      let result;
      // run the transaction within the session
      await session.withTransaction(async () => {
        // get the product details for the given product ID
        let {
          data: product,
          message,
          status,
        } = await this.getProduct(productId);
        // throw an error if the product is not found
        if (!status) {
          throw message;
        }
        // calculate the total cost for the purchase
        let totalCost = productDetail.amount * product.cost;

        // check if the user has enough balance for the purchase
        if (userDetails.account.balance < totalCost) {
          throw `Insufficient balance product cost ${totalCost}`;
        }

        // deduct the purchase amount from the user's account balance
        userDetails.account.balance = userDetails.account.balance - totalCost;
        await userDetails.account.save({ session });

        // create a new purchase record for the user and product
        const purchase = {
          userId: userDetails._id,
          productId: productId,
          unit: productDetail.amount,
          totalPrice: totalCost,
        };
        let [newPurchase] = await this.#models.Purchase.create([purchase], {
          session,
        });
        // add the new purchase record to the user's purchase history
        userDetails.purchases = [...userDetails.purchases, newPurchase._id];
        await userDetails.save({ session });

        // prepare the response object with the purchase and change details
        result = {
          data: { newPurchase, totalSpent: totalCost },
          status: true,
          message: "purchase successful",
          change: this.convertToDenominations(userDetails.account.balance),
        };
      });

      // end the session
      session.endSession();
      return result;
    } catch (error) {
      return { data: null, status: false, message: error };
    }
  };

  // This function retrieves a product from the database, given its ID
  getProduct = async (productId) => {
    try {
      // Look for a product with the given ID in the Product collection
      let product = await this.#models.Product.findOne({
        _id: productId,
      });
      
      // If no product is found, throw an error
      if (!product) {
        throw "Product not found";
      }
      // If a product is found, return it along with a success status and message
      return {
        data: product,
        status: true,
        message: "Product fetch successfully",
      };
    } catch (error) {
      // If an error occurs, return null data along with a failure status and the error message
      return {
        data: null,
        status: false,
        message: error,
      };
    }
  };

  deleteProduct = async (productId, sellerId) => {
    // defines a method called deleteProduct that takes in a productId and sellerId as parameters
    try {
      // starts a try-catch block to handle errors
      const deletedProduct = await this.#models.Product.findOneAndDelete({
        // searches for a product with the given productId and sellerId and deletes it
        _id: productId,
        sellerId,
      });
      if (!deletedProduct) {
        // if the product wasn't found, throws an error
        throw "Product not found";
      }
      return {
        // returns a success message and status if the product was successfully deleted
        status: true,
        message: `product with id ${deletedProduct.id} deleted successfully`,
      };
    } catch (error) {
      // if an error occurred, returns an error message and status
      return { data: null, status: false, messsage: error };
    }
  };
  updatedProduct = async (productDetails, sellerId, productId) => {
    try {
      // Find and update the product with the given `productId` and `sellerId`
      const updatedProduct = await this.#models.Product.findOneAndUpdate(
        { _id: productId, sellerId },
        { $set: { ...productDetails } },
        { new: true }
      );
      // If no product was found to update, throw an error
      if (!updatedProduct) {
        throw "Product not found";
      }
      // Return the updated product with a success message
      return {
        data: updatedProduct,
        status: true,
        message: "product updated successfully",
      };
    } catch (error) {
      // If an error occurred during the update, return an error message
      return { data: null, status: false, message: error };
    }
  };

  convertToDenominations = (amount) => {
    // Array of available denominations
    let denominations = [100, 50, 30, 5];

    // Array to store the resulting denominations
    let result = [];

    // Loop through the denominations
    for (let i = 0; i < denominations.length; i++) {
      // If the amount is greater than or equal to the current denomination
      while (amount >= denominations[i]) {
        // Add the denomination to the result array
        result.push(denominations[i]);

        // Subtract the denomination from the amount
        amount -= denominations[i];
      }
    }

    // Ensure that the final result is a multiple of 5
    let remainder = result.reduce((a, b) => a + b, 0) % 5;
    if (remainder !== 0) {
      // If the remainder is not 0, calculate the difference needed to make it a multiple of 5
      let diff = 5 - remainder;

      // Remove the last element from the result array
      let lastElement = result.pop();

      // Subtract the difference from the last element and add it back to the result array
      result.push(lastElement - diff);

      // Add the difference as a new element to the result array
      result.push(diff);
    }

    // Return the resulting array of denominations
    return result;
  };
}

module.exports = {
  class: ProductController,
  injectableModel: [ProductSchema, PurchaseSchema],
  injectableClass: [UserController],
};
