const db = require("../../config/connection");
const {ObjectId} = require("mongodb");
const collectionNames = require("../../config/collectionNames")

module.exports={
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
           const products=await db
            .get()
            .collection(collectionNames.PRODUCT_COLLECTION)
            .find({isDeleted:false})
            .toArray()
            resolve(products)
            
        })
    },
    deleteProduct:(data)=>{
        return new Promise((resolve, reject) => {
            db.get()
              .collection("Products")
              .updateOne({ _id:  ObjectId(data.query.id) },{$set:{isDeleted:true}})
              .then(() => {
                resolve({ productDeleted: true });
              });
          });
    }
}