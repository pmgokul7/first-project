const db = require("../config/connection");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const moment = require("moment");
const { promiseImpl } = require("ejs");

module.exports = {
  checkCode: (data) => {
    return new Promise(async (resolve, reject) => {
      const result = await db
        .get()
        .collection("coupons")
        .findOne({ ID: data.body.code });
        if(result){
        
          console.log(data.body.cartPrice);
          if(result.users.includes(data.session.user._id) == true || result.count <= 0 || result.minimum > data.body.cartPrice){
            console.log(result.users.includes(data.session.user._id) == true);
            console.log(result.count <= 0);
            console.log(result.minimum < data.body.cartPrice);
                resolve({ couponFound: false,result });
            }
            else{
                resolve({ couponFound: true,result });  
            }
        }
        else{
          resolve({ couponFound: false });  
        }

    });

  },

  removeCoupon:(data)=>{
    return new Promise(async(resolve,reject)=>{
    const result=await  db.get().collection("coupons").findOne({ID:data.body.code})
    if(result){
      db.get().collection("coupons").updateOne({ID:data.body.code},{$pull:{users:data.session.user._id}}).then(()=>{
        console.log("id removed successfully");
      })
    }
    })
  },

  
  adminCouponDelete:(data)=>{
return new Promise((resolve,reject)=>{
  db.get().collection("coupons").deleteOne({_id:ObjectId(data.params.id)}).then(()=>{
    resolve({deleted:true})
  })
})
  }
};
