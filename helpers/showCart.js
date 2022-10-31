const db = require("../config/connection");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");

module.exports = {
  showCart: (data) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection("cart")
        .findOne({ user: new ObjectId(data.session.user._id) })
        .then((results) => {
          if (results) {
            db.get()
              .collection("cart")
              .aggregate([
                { $match: { user: new ObjectId(data.session.user._id) } },
                { $unwind: "$products" },
                {
                  $lookup: {
                    from: "Products",
                    localField: "products.product",
                    foreignField: "_id",
                    as: "p",
                  },
                },
              ])
              .toArray()
              .then((result) => {
                // console.log(result);
                if (result) {
                  resolve({ resultfound: true, ress: result });
                  // result.render("user/cart",{result})
                } else {
                  console.log("empty cart");
                }
              });
          } else {
            db.get()
              .collection("cart")
              .insertOne({
                user: new ObjectId(data.session.user._id),
                products: [],
                count: 0,
              })
              .then(() => {
                console.log("done");
              });
          }
        });
    });
  },
};
