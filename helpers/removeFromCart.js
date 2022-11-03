const db = require("../config/connection");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");

module.exports = {
  removeFromCart: (data) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection("cart")
        .updateOne(
          { user:  ObjectId(data.session.user._id) },
          { $pull: { products: { product:  ObjectId(data.body.id) } } }
        )
        .then((result) => {
          resolve({ removedfromcart: true });
        });
    });
  },
};
