
const db = require("../config/connection");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
module.exports = {
getCartProducts:(data)=>{
   return new Promise((resolve,reject)=>{
        db.get().collection("cart").aggregate([
            {
                $match:{user:ObjectId(data.session.user._id)}
            },
            {
                $lookup: {
                    from: "Products",
                    localField: "products.product",
                    foreignField: "_id",
                    as: "p",
                  }
            }
        ]).toArray().then((result)=>{
            console.log(result[0]);
            resolve(result)
        })
        
   })
}
};
