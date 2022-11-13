const db = require("../config/connection");
const { ObjectId } = require("mongodb");


module.exports={
    addToWishHelper:(data)=>{
        return new Promise((resolve,reject)=>{
            db
    .get()
    .collection("wishlist")
    .updateOne(
      { user: ObjectId(data.session.user._id) },
      { $push: { products: { product: ObjectId(data.body.pid) } } }
    )
    .then((result) => {
    //   console.log("inserted to wishlist");
    resolve({added:true})
    });
        })
    }
}