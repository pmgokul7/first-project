const db = require("../config/connection");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");

module.exports = {
  userEdit: (data) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection("user")
        .updateOne(
          { _id:  ObjectId(data.id) },
          { $set: { userBlocked: true } }
        )
        .then(() => {
          resolve({ statusUpdated: true });
        });
    });
  },
  userDelete: (data) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection("user")
        .deleteOne({ _id:  ObjectId(data.id) })
        .then(() => {
          resolve({ userDeleted: true });
        });
    });
  },
  productDelete: (data) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection("Products")
        .updateOne({ _id:  ObjectId(data.id) },{$set:{isDeleted:true}})
        .then(() => {
          resolve({ productDeleted: true });
        });
    });
  },
  productManagement: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection("Products")
        .find()
        .toArray()
        .then((result) => {
          resolve({ result });
        });
    });
  },
  addCoupon:(data)=>{
    return new Promise(async(resolve,reject)=>{
      // console.log(typeof(data.body.code));
      const present=await db.get().collection("coupons").findOne({ID:data.body.code.toUpperCase()})
      if(present){
        resolve({alreadyThere:true})  
      }
      else
      {
      
        db.get().collection("coupons").insertOne({ID:data.body.code.toUpperCase(),discount:parseInt(data.body.discount),users:[],count:Number(data.body.count)}).then(()=>{
  resolve({inserted:true})
        })
     
      }
     
    })
  }
};
