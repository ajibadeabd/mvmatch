const request = require("supertest");
const app = require("../src/server/server");
const mongoose = require("mongoose");

let server;
beforeAll(async () => {
  server = (await app).server;
});

afterAll(async () => {
  console.log("close");
  await mongoose.connection.close();
  await server.close();
});
let seller = {
  username: `user${Date.now()}`,
  password: `fisrstName${Date.now()}`,
  role: "seller",
};
let buyer = {
  username: `user${Date.now()}` + 1,
  password: `fisrstName${Date.now()}` + 1,
  role: "buyer",
};

let product = {
  productName: "Product Name update",
  description: "This is a description of the product.",
  cost: 10,
};
let wrongProductId = "641d48eb8b4279bb643305a2";
let sellerToken, buyerToken;
describe("CREATE /users", () => {
  it("respond with error when creating an account without details", (done) => {
    request(server)
      .post("/api/v1/user")
      .set("Accept", "application/json")
      .end((err, res) => {
        expect(res.body.error).toEqual([
          "Password is required",
          "Password should be a string",
          "Role is required",
          "Role should be a string",
          "Role should be either 'buyer' or 'seller'",
          "Username is required",
          "Username should be a string",
        ]);
        done();
      });
  });

  describe("CREATE /users", () => {
    it("respond with success when creating an account with correct detail details", (done) => {
      request(server)
        .post("/api/v1/user")
        .set("Accept", "application/json")
        .send(seller)
        .end((err, res) => {
          expect(res.body.user.username).toEqual(seller.username);
          done();
        });
    });
  });
  describe("CREATE /users", () => {
    it("respond with success when creating an account with correct detail details", (done) => {
      request(server)
        .post("/api/v1/user")
        .set("Accept", "application/json")
        .send(buyer)
        .end((err, res) => {
          expect(res.body.user.username).toEqual(buyer.username);
          done();
        });
    });
  });
  describe("Login /users seller", () => {
    it("respond with success when creating an account with correct detail details", (done) => {
      request(server)
        .post("/api/v1/user/login")
        .set("Accept", "application/json")
        .send(seller)
        .end((err, res) => {
          expect(res.body.user.username).toEqual(seller.username);
          expect(res.body.status).toEqual(true);
          sellerToken = res.body.token;
          expect(res.body.message).toEqual("user logged in  successfully");
          done();
        });
    });
  });
  describe("Login /users   buyer", () => {
    it("respond with success when creating an account with correct detail details", (done) => {
      request(server)
        .post("/api/v1/user/login")
        .set("Accept", "application/json")
        .send(buyer)
        .end((err, res) => {
          expect(res.body.user.username).toEqual(buyer.username);
          expect(res.body.status).toEqual(true);
          buyerToken = res.body.token;
          expect(res.body.message).toEqual("user logged in  successfully");
          done();
        });
    });
  });

  describe("buyer should deposit successfully", () => {
    it("respond with success when creating an account with correct detail details", (done) => {
      request(server)
        .post("/api/v1/account/deposit")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${buyerToken}`)
        .send({ amount: 150 })
        .end((err, res) => {
          expect(res.body.data.balance).toEqual(150);
          expect(res.body.status).toEqual(true);
          done();
        });
    });
  });

  describe("SHOULD return error when buyer try to add product  ", () => {
    it("respond with success when creating an account with correct detail details", (done) => {
      request(server)
        .post("/api/v1/product")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${buyerToken}`)
        .send(product)
        .end((err, res) => {
          expect(res.body.message).toEqual(
            "unauthorize, action can only be perform by seller"
          );
          done();
        });
    });
  });

  describe("SHOULD return success when seller add product", () => {
    it("respond with success when creating an account with correct detail details", (done) => {
      request(server)
        .post("/api/v1/product")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${sellerToken}`)
        .send(product)
        .end((err, res) => {
          expect(res.body.message).toEqual("product created successfully");
          product = res.body.data;
          done();
        });
    });
  });

  describe("SHOULD return success when seller add product", () => {
    it("respond with success when creating an account with correct detail details", (done) => {
      request(server)
        .patch(`/api/v1/product/${product._id}`)
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${sellerToken}`)
        .send(product)
        .end((err, res) => {
          expect(res.body.message).toEqual("product updated successfully");
          product = res.body.data;
          done();
        });
    });
  });

  describe("SHOULD return error when seller add same product twice ", () => {
    it("respond with success when creating an account with correct detail details", (done) => {
      request(server)
        .post("/api/v1/product")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${sellerToken}`)
        .send(product)
        .end((err, res) => {
          expect(res.body.message).toEqual("product already added");
          done();
        });
    });
  });
  describe("SHOULD return success when buyer try to buy product", () => {
    it("respond with success when creating an account with correct detail details", (done) => {
      request(server)
        .post(`/api/v1/product/buy/${product._id}`)
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${buyerToken}`)
        .send({ amount: 10 })
        .end((err, res) => {
          expect(res.body.message).toEqual("purchase successful");
          done();
        });
    });
  });

  describe("SHOULD return success when buyer try to buy product with insufficient account", () => {
    it("respond with success when creating an account with correct detail details", (done) => {
      request(server)
        .post(`/api/v1/product/buy/${product._id}`)
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${buyerToken}`)
        .send({ amount: 10 })
        .end((err, res) => {
          expect(res.body.message).toEqual(
            "Insufficient balance product cost 100"
          );
          done();
        });
    });
  });
  describe("SHOULD return error when buyer try to buy a non existing product", () => {
    it("respond with success when creating an account with correct detail details", (done) => {
      request(server)
        .post(`/api/v1/product/buy/${wrongProductId}`)
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${buyerToken}`)
        .send({ amount: 10 })
        .end((err, res) => {
          expect(res.body.message).toEqual("Product not found");
          done();
        });
    });
  });
});
