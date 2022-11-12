const db = require("../config/connection");
const moment=require("moment")

const bcrypt = require("bcrypt");
const { ObjectId, Db } = require("mongodb");
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
              db.get().collection("user").findOne({_id:ObjectId(data.session.user._id)}).then(user=>{
                resolve({ result, user });
              })
              
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
    if(data.body.usewallet){
     
     
         walletbalance=data.session.user.wallet
    
       
      
    }else{
      walletbalance=0
    }
    console.log("body issssssssssssssssssssss",data.body);
    console.log("WALLETBALANCE issssssssssssssssssssss",walletbalance);
    return new Promise(async(resolve, reject) => {
      product=await db.get().collection("Products").findOne({_id:ObjectId(data.body.productid)})
      db.get()
        .collection("orders")
        .insertOne({
          product: [{product:ObjectId(data.body.productid),count:1,status:"placed", total:parseInt(product.offerprice)-parseInt(product.offerprice)*data.body.discount/100-walletbalance < 0 ? 0 :parseInt(product.offerprice)-parseInt(product.offerprice)*data.body.discount/100-walletbalance}] ,
          user: data.session.user.name,
          method: "COD",
          status: "placed",
          paymentstatus:"success",
          address:JSON.parse( data.body.address),
          time:moment().format("L"),
          coupon:data.body.ID  ?data.body.ID :null,
          discount:data.body.discount ? data.body.discount:0,
          date:new Date(),
          quantity: 1,
          wallet:data.body.usewallet,
          total:(parseInt(product.offerprice)-parseInt(product.offerprice)*data.body.discount/100-walletbalance )< 0 ? 0 : (parseInt(product.offerprice)-parseInt(product.offerprice)*data.body.discount/100)-walletbalance
        })
        .then((result) => {
          idd=result.insertedId
          db.get().collection("orders").findOne({_id:idd}).then(order=>{
            console.log(parseInt(product.offerprice)-parseInt(product.offerprice)*data.body.discount/100-order.product[0].total);
            order=order
            db.get().collection("coupons").updateOne({ID:data.body.ID},{$push:{users:data.session.user._id}}).then(()=>{
              db.get().collection("user").updateOne({_id:ObjectId(data.session.user._id)},{$inc:{wallet:-parseInt(product.offerprice)-parseInt(product.offerprice)*data.body.discount/100-order.product[0].total}}).then(()=>{
                console.log("coupon success and wallet minus  ");
              })
                
              }) 


               console.log("this is order",order);
          resolve(result);
          })
       
        })
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
