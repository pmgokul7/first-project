const db = require("../config/connection");
const moment=require("moment")

const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
module.exports = {
  info: (data) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection("Products")
        .findOne({ _id:  ObjectId(data.query.id) })
        .then((result) => {
          db.get()
            .collection("cart")
            .findOne({
              $and: [
                { "products.product":  ObjectId(data.query.id) },
                { user:  ObjectId(data.session.user._id) },
              ],
            })
            .then((ifres) => {
              db.get().collection("wishlist").findOne({$and:[
                {"products.product":ObjectId(data.query.id)},
                { user:  ObjectId(data.session.user._id)}
              ]}).then(wishlistp=>{

               if (ifres&&wishlistp) {
                resolve({ result, ifres,wishlistp });
              } else if(ifres){
                resolve({ result,ifres });
              }else if(wishlistp){
                resolve({ result,wishlistp });
              }
              else{
                resolve({ result });
              }

              })
             
            });
        });
    });
  },
  myOrders: (data) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection("orders")
        .aggregate([
          { $match: { user: data.session.user.name } },
          {
            $lookup: {
              from: "Products",
              localField: "product.product",
              foreignField: "_id",
              as: "p",
            },
          },
          { $sort: { time: -1 } },
        ])
        .toArray()
        .then((result) => {
          console.log(result);
          resolve(result);
        });
    });
  },
  checkout: (data) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection("Products")
        .findOne({ _id:  ObjectId(data.params.id) })
        .then((result) => {
          db.get()
            .collection("user")
            .findOne({ _id:  ObjectId(data.session.user._id) })
            .then((user) => {
              resolve({ result, user });
            });
        });
    });
  },
  addressAdd: (data) => {
    return new Promise((resolve, reject) => {
    
      if(data.body.name==""||data.body.address1==""||data.body.address1==""||data.body.post==""||data.body.pin==""||data.body.mobile==""){
        resolve({empty:true})
      }else{
  db.get()
        .collection("user")
        .updateOne(
          { _id:  ObjectId(data.session.user._id) },
          { $addToSet: { address: data.body } }
        )
        .then((s) => {
          resolve({ add: true });
        });
      }
      console.log(data.body);
    });
  },

  confirmCODOrder: (data) => {
    console.log("body is",data.body);
    return new Promise(async(resolve, reject) => {
      product=await db.get().collection("Products").findOne({_id:ObjectId(data.body.productid)})
      db.get()
        .collection("orders")
        .insertOne({
          product: [{product:ObjectId(data.body.productid),count:1,status:"placed"}] ,
          user: data.session.user.name,
          method: "COD",
          status: "placed",
          paymentstatus:"success",
          address:JSON.parse( data.body.address),
          time:moment().format("L"),
          coupon:data.body.ID  ?data.body.ID :null,
          date:new Date(),
          quantity: 1,
          total:parseInt(product.price)-parseInt(product.price)*data.body.discount/100
        })
        .then((result) => {
          resolve(result);
        }).then(()=>{
          // db.get().collection("Products").updateOne({_id:new ObjectId(data.body.productid)},{$inc:{stock:-data.body.quantity}})
              db.get().collection("coupons").updateOne({ID:data.body.ID},{$push:{users:data.session.user._id}}).then(()=>{
                  console.log("coupon success");
                }) 
        });
    });

    
    // console.log(data.body);
  },


  orderCancel: (data) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection("orders")
        .updateOne(
          { _id:  ObjectId(data.query.id) },
          { $set: { status: "canceled" } }
        )
        .then(() => {
          resolve({ deleted: true });
          console.log("order deleted");
        });
    });
  },
};
