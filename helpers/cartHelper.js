
const db = require("../config/connection");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const moment=require("moment")
module.exports = {
getCartProducts:(data)=>{

return new Promise((resolve,reject)=>{
        db.get().collection("cart").aggregate([

            {
                $match:{user:ObjectId(data.session.user._id)}
            },
            {
                $unwind:'$products'
            },
           
            {
                $lookup: {
                                        from: "Products",
                                        localField: "products.product",
                                        foreignField: "_id",
                                        as:"pro",
                                      }
            },
            {
              $project:{
                "products.product":1,
                "products.count":1,
                pro:{$arrayElemAt:['$pro',0]}

                
              }
            }
        ]).toArray().then((cartItems)=>{
            // console.log("cccccccccccccccc",cartItems);
            resolve(cartItems)
        })
})
},
changeProQuantity:(data)=>{
    // console.log(data.body);
    return new Promise((resolve,reject)=>{
          db.get().collection("cart").updateOne({user:ObjectId(data.session.user._id),"products.product":ObjectId(data.body.product)},{
            $inc:{'products.$.count':parseInt(data.body.count)}
          }).then((r)=>{
            // console.log(r);
            resolve({updated:true})
          })
    })
}
};
