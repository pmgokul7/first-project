const db = require("../config/connection");
const bcrypt=require("bcrypt")
const { ObjectId } = require("mongodb");

module.exports={
    changePasswordHelper:(data)=>{
        return new Promise((resolve,reject)=>{
            db
            .get()
            .collection("user")
            .findOne({ _id: ObjectId(data.session.user._id) })
            .then((result) => {
              // console.log(req.body);
      
              if (result) {
                bcrypt
                  .compare(data.body.oldpass, result.password)
                  .then((compareresult) => {
                    if (compareresult == true) {
                      console.log("old and new password match");
                      bcrypt.hash(data.body.newpass, 10).then((hashedPass) => {
                        con
                          .get()
                          .collection("user")
                          .updateOne(
                            { _id: ObjectId(data.session.user._id) },
                            { $set: { password: hashedPass } }
                          )
                          .then(() => {
                            console.log("updated successfully");
                            resolve({status:"updated"})
                            // res.send({ status: "updated" });
                          });
                      });
                    } else {
                        resolve({status:"error"})
                    //   res.send({ status: "error" });
                      console.log("old and new password wont match");
                    }
                  });
              } 
            });
        })
    }
}