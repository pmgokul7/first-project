const db = require("../config/connection");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");

module.exports = {
  addToCart: (data) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection("cart")
        .findOne({ user: new ObjectId(data.session.user._id) })
        .then((already) => {
          if (already) {
            db.get()
              .collection("cart")
              .updateOne(
                { user: new ObjectId(data.session.user._id) },
                {
                  $addToSet: {
                    products: {
                      product: new ObjectId(data.body.id),
                      count: parseInt(1),
                    },
                  },
                }
              )
              .then(() => {
                resolve({ added: true });
              });
          }
        });
    });
  },
};
