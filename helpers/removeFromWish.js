const db = require("../config/connection");
const { ObjectId } = require("mongodb");

module.exports={
    removeFromWishHelper:(data)=>{
        return new Promise((resolve,reject)=>{
            db
            .get()
            .collection("wishlist")
            .updateOne(
              { user: ObjectId(data.session.user._id) },
              { $pull: { products: { product: ObjectId(data.body.pid) } } }
            )
            .then((r) => {
              // console.log(r);
              resolve({removed:true})
           
            });
        })
    }
}