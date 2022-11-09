const db = require("../config/connection");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const moment = require("moment");


module.exports={
    getProfile:(data)=>{
        return new Promise(async(resolve,reject)=>{
            const result= await db .get() .collection("user") .findOne({ _id: ObjectId(data.session.user._id) })
            resolve({result})
           

        })
    }
}