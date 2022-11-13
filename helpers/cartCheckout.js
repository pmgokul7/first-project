const db = require("../config/connection");
const { ObjectId } = require("mongodb");

module.exports={
    cartCheckOut:(data)=>{
        return new Promise((resolve,reject)=>{
         db
            .get()
            .collection("cart")
            .aggregate([
              {
                $match: { user: ObjectId(data.session.user._id) },
              },
              {
                $unwind: "$products",
              },
        
              {
                $lookup: {
                  from: "Products",
                  localField: "products.product",
                  foreignField: "_id",
                  as: "pro",
                },
              },
              {
                $project: {
                  "products.product": 1,
                  "products.count": 1,
                  pro: { $arrayElemAt: ["$pro", 0] },
                },
              },
              {
                $group: {
                  _id: null,
                  total: {
                    $sum: { $multiply: ["$products.count", "$pro.offerprice"] },
                  },
                },
              },
            ])
            .toArray()
            .then((cartItems) => {
              db
                .get()
                .collection("cart")
                .aggregate([
                  { $match: { $and: [{ user: ObjectId(data.session.user._id) }] } },
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
                  globalcartTotal = cartItems;
                  cartProducts = result;
                 db.get().collection("user").findOne({_id:ObjectId(data.session.user._id)}).then(user=>{
                  
                  resolve({result,user,cartItems,cartProducts,globalcartTotal})
                 })
                  
                  console.log(data.session.user);
                });
            });
        
        })
    }
}