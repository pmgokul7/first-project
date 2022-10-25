const db=require("../config/connection")
const bcrypt=require("bcrypt")
const { ObjectId } = require("mongodb")

module.exports={
    userEdit:(data)=>{
        return new Promise((resolve,reject)=>{

          db.get().collection("user").updateOne({_id:new ObjectId(data.id)},{$set:{userBlocked:true}}).then(()=>{
            resolve({statusUpdated:true})
          })
        })
        
    },
    userDelete:(data)=>{
     return new Promise((resolve,reject)=>{
      db.get().collection("user").deleteOne({_id:new ObjectId(data.id)}).then(()=>{
        resolve({userDeleted:true})
      })
     })
           
      
    },
    productDelete:(data)=>{
      return new Promise((resolve,reject)=>{
        db.get().collection("Products").deleteOne({_id:new ObjectId(data.id)}).then(()=>{
          resolve({productDeleted:true})
        })
      })
    },
    productManagement:()=>{
      return new Promise((resolve,reject)=>{
        db.get().collection("Products").find().toArray().then((result)=>{
          resolve({result})
        })
      })
    }



}