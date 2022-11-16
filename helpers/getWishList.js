const db = require("../config/connection");
const { ObjectId } = require("mongodb");

module.exports={
    getWishListHelper:(data)=>{
      return new Promise((resolve,reject)=>{
      db.get().collection("wishlist").findOne({user:ObjectId(data.session.user._id)}).then(wish=>{
        if(wish){
          db
          .get()
          .collection("wishlist")
          .aggregate([
            { $match: { user: ObjectId(data.session.user._id) } },
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
          .then((r) => {
              resolve({r})
            console.log("this is wishlist", r);
       
          });
        }else{
          db.get().collection("wishlist").insertOne({
  
            user:ObjectId(data.session.user._id),
            products: [
              
            ]
          }).then((r)=>{
            resolve({r})
          })
        }
      })



       
      })
    }
}