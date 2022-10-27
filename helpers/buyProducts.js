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
                            resolve({result,ifres})
                        
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
    },
    checkout:(data)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection("Products").findOne({_id:new ObjectId(data.params.id)}).then((result)=>{
                db.get().collection("user").findOne({_id:new ObjectId(data.session.user._id)}).then((user)=>{
                 resolve({result,user})
                })
         
                 
             })

        })
       
    },
    addressAdd:(data)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection("user").updateOne({_id:new ObjectId(data.session.user._id)},{$addToSet:{address:data.body}}).then((s)=>{
                resolve({add:true})
            })
        })
    },

    confirmCODOrder:(data)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection("orders").insertOne({product:new ObjectId(data.body.productid),user:(data.session.user.name),method:"COD",status:"placed",address:data.body.address,time:data.body.date,quantity:data.body.quantity,total:parseInt(data.body.price)*parseInt(data.body.quantity)}).then((result)=>{
                resolve(result)
            })
        })
    },

    orderCancel:(data)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection("orders").updateOne({_id:new ObjectId(data.query.id)},{$set:{status:"canceled"}}).then(()=>{
                resolve({deleted:true})
                console.log("order deleted");
            })
        })
    }
}