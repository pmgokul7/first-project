const db = require("../config/connection");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");


module.exports={
    productSearchHelper:(data)=>{
        return new Promise((resolve,reject)=>{
            db
            .get()
            .collection("Products")
            .find({ model: { $regex: data.body.search, $options: "i" } })
            .toArray()
            .then((result) => {
            
                
                  searcsh = data.body.search;
                 resolve({result,searcsh,user:data.session.user})
                 
            });
        })
    }
}