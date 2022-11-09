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
        
      
          if(result.users.includes(data.session.user._id)){
            console.log("user is in the coupon array");
                resolve({ couponFound: false });
                console.log("coupon failed");
            }
            else{
                resolve({ couponFound: true,result });
                db.get().collection("coupons").updateOne({ID:data.body.code},{$push:{users:data.session.user._id}}).then(()=>{
                  console.log("coupon success");
                })
                
                
            }
        }

    });

    console.log(data.body);
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
