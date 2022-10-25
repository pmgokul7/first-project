const db=require("../config/connection")
const bcrypt=require("bcrypt")
const { ObjectId } = require("mongodb")
module.exports={
    info:(data)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection("Products").findOne({_id:new ObjectId(data.query.id)}).then((result)=>{
                    db.get().collection("cart").findOne({$and:[{product:new ObjectId(data.query.id)},{user:data.session.user._id}]}).then((ifres)=>{
                        if(ifres)
                        {
                            resolve({result,text1})
                        
                        }
                        else{
                            resolve({result})   
                        }
                    })
                
                
                })
        })
    },
    myOrders:(data)=>{
        return new Promise((resolve,reject)=>{
            
                db.get().collection("orders").aggregate([{$match:{user:data.session.user.name}},{$lookup:{
              
                  from:"Products",
                  localField:"product",
                  foreignField:"_id",
                  as:"p"
                }},{$sort:{time:-1}}]).toArray().then((result)=>{
                      resolve(result)
                  })
              
        })
    }
}