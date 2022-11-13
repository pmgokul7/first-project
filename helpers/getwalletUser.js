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
               if (user) {
                resolve({user:user})
          }
            })
        })
    }
}