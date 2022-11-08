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
              localField: "product",
              foreignField: "_id",
              as: "p",
            },
          },
          { $sort: { time: -1 } },
        ])
        .toArray()
        .then((result) => {
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
    return new Promise((resolve, reject) => {
      db.get()
        .collection("orders")
        .insertOne({
          product:  ObjectId(data.body.productid),
          user: data.session.user.name,
          method: "COD",
          status: "placed",
          paymentstatus:"success",
          address:JSON.parse( data.body.address),
          time:moment().format("L"),
          date:new Date(),
          quantity: data.body.quantity,
          total: parseInt(data.body.price)
        })
        .then((result) => {
          resolve(result);
        }).then(()=>{
          // db.get().collection("Products").updateOne({_id:new ObjectId(data.body.productid)},{$inc:{stock:-data.body.quantity}})
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
