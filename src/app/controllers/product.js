const ProductSchema = require("../models/product");

class ProductController {
  #packages;
  #models;
  constructor({ packages, models }) {
    this.#packages = packages;
    this.#models = models;
  }
  createProduct = async (productDetails, sellerId) => {
    try {
      let product = await this.#models.Product.findOne({
        productName: productDetails.productName,
        sellerId,
      });
      if (product) {
        throw "product already added";
      }
      product = await this.#models.Product.create({
        ...productDetails,
        sellerId,
      });
      return { data: product, status: true };
    } catch (err) {
      return { data: null, status: false, err };
    }
  };
  getProduct = async (productId, sellerId) => {
    try {
      let product = await this.#models.Product.findOne({
        id: productId,
        sellerId,
      });
      if (!product) {
        throw "product not found";
      }
      return { data: product, status: true };
    } catch (err) {
      return { data: null, status: false, err };
    }
  };
  deleteProduct = async (productId, sellerId) => {
    try {
      const deletedProduct = await this.#models.Product.findOneAndDelete({
        id: productId,
        sellerId,
      });

      if (!deletedProduct) {
        throw "Product not found";
      }
      return {
        data: updatedProduct,
        status: true,
        message: "product deleted successfully",
      };
    } catch (err) {
      return { data: null, status: false, err };
    }
  };
  updatedProduct = async (productDetails, sellerId) => {
    try {
      const updatedProduct = await this.#models.Product.findOneAndUpdate(
        { id: productDetails.productId, sellerId },
        { $set: { ...productDetails } },
        { new: true }
      );
      if (!updatedProduct) {
        throw "Product not found";
      }
      return {
        data: updatedProduct,
        status: true,
        message: "product updated successfully",
      };
    } catch (err) {
      return { data: null, status: false, err };
    }
  };

  purchaseProduct = async (productDetails, buyer) => {};
  getProducts = async (sellerId) => {
    let products = await this.#models.Product.findOne({
      sellerId,
    });

    return {
      data: products,
      status: true,
      message: "product fetch successfully",
    };
  };
}

module.exports = {
  class: ProductController,
  injectableModel: [ProductSchema],
};
