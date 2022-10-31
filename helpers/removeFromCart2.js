const db = require("../config/connection");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
module.exports = {
  removeFromCart2: (data) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection("cart")
        .updateOne(
          { user: new ObjectId(data.session.user._id) },
          { $pull: { products: { product: new ObjectId(data.query.id) } } }
        )
        .then(() => {
          // console.log("item deleted from cart");
          // req.flash('info','ha')
          resolve({ deleted: true });
        });
    });
  },
};
