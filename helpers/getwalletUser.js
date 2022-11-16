const db = require("../config/connection");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");

module.exports={
    getWallet:(data)=>{
        return new Promise((resolve,reject)=>{
            db
            .get()
            .collection("user")
            .findOne({ _id: ObjectId(data.session.user._id) }).then(user=>{
                db.get().collection("wallet").find({user:ObjectId(data.session.user._id)}).toArray().then(wallet=>{
                    if (user) {
                        resolve({user:user,wallet:wallet})
                  }
                })
              
            })
        })
    }
}