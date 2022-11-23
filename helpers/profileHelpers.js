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
    },
    changePassword:(data)=>{
        return new Promise(async(resolve,reject)=>{
            if (data.body.oldpass == "" || data.body.newpass == "" || data.body.repeatpass == "") {
                console.log("fileld is mt");
                resolve({status:"empty"});
            }
            else if(data.body.newpass!=data.body.repeatpass){
                console.log("conform and repeat should be same");
                resolve({status: "notsame"});
            }else {
                db.get().collection("user").findOne({
                    _id: ObjectId(data.session.user._id)
                }).then((result) => { // console.log(data.body);
              
                    if (result) {
                        bcrypt.compare(data.body.oldpass, result.password).then((compareresult) => {
                            if (compareresult == true) {
                                console.log("old and new password match");
                                bcrypt.hash(data.body.newpass, 10).then((hashedPass) => {
                                    db.get().collection("user").updateOne({
                                        _id: ObjectId(data.session.user._id)
                                    }, {
                                        $set: {
                                            password: hashedPass
                                        }
                                    }).then(() => {
                                        console.log("updated successfully");
                                        resolve({status: "updated"})
                                        // res.send({status: "updated"});
                                    });
                                });
                            } else {
                                resolve({status: "error"});
                                console.log("entered pass word is incorrect");
                            }
                        });
                    } else {
                        resolve({status:"nouser"})
                        // res.redirect("/login");
                    }
                });
            }
        })
    }
}