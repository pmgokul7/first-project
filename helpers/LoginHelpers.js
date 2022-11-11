const db = require("../config/connection");
const bcrypt = require("bcrypt");
const { request } = require("express");
const myref = require("otp-generators");
const { ObjectId } = require("mongodb");
// const otpgen=require("otpGenerators")
module.exports = {
  userloginValidator: (data) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection("user")
        .findOne({ mobile: data.mobile })
        .then((result) => {
          if (result) {
            bcrypt
              .compare(data.password, result.password)
              .then((compareRes) => {
                if (
                  compareRes == true &&
                  data.mobile == result.mobile &&
                  result.status == "active"
                ) {
                  resolve({
                    loginstatus: true,
                    blocked: false,
                    result,
                    admin: false,
                  });
                } else if (
                  compareRes == true &&
                  data.mobile == result.mobile &&
                  result.status == "block"
                ) {
                  resolve({ loginstatus: false, blocked: true });
                } else {
                  resolve({ loginstatus: false, blocked: true });
                }
              });
          } else {
            resolve({ loginstatus: false, userfound: false });
          }
        });
    });
  },

  userOtpValidator: () => {
    return new Promise((resolve, reject) => {});
  },

  userSignupValidator: (data) => {
    return new Promise((resolve, reject) => {
      const myreferal = myref.generate(5, {
        alphabets: true,
        upperCase: true,
        specialChar: false,
      });
      db.get()
        .collection("user")
        .findOne({ mobile: Number(data.mobile) })
        .then((result) => {
          if (result != null) {
            resolve({ emailfound: true });
          } else {
            bcrypt.hash(data.password, 10).then((hashedpass) => {
              hashedpass.toString();
              db.get()
                .collection("user")
                .insertOne({
                  name: data.user,
                  mobile: data.mobile,
                  email: data.email,
                  password: hashedpass,
                  status: "active",
                  myreferal: myreferal,
                  referal: data.referal,
                  referalusers: [],
                  wallet:0
                })
                .then((r) => {
                  insertedId=r.insertedId
                  if (data.referal != "") {
                    db.get()
                      .collection("user")
                      .findOne({ myreferal: data.referal })
                      .then((user) => {
                        if (user) {
                          db.get()
                            .collection("user")
                            .updateOne(
                              { _id: ObjectId(user._id) },
                              { $set: { wallet: user.wallet+50 },$push:{referalusers:insertedId} }
                            )
                            .then(() => {

                              resolve({ Signupstatus: true });
                            });
                        }
                      });
                  }
                });
            });
          }
        });
    });
  },
  adminLoginValidator: (data) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection("admins")
        .findOne({ username: data.mobile })
        .then((result) => {
          if (result) {
            bcrypt
              .compare(data.password, result.password)
              .then((compareres) => {
                if (compareres == true && data.mobile == result.username) {
                  resolve({ adminlogged: true });
                  console.log("admin true");
                } else {
                  resolve({ adminlogged: false });
                  console.log("admin false");
                }
              });
          } else {
            resolve({ adminlogged: false, adminfound: false });
            console.log("admin not found");
          }
        });
    });
  },
  otploginvalidator: (data, otp) => {
    return new Promise((resolve, request) => {
      db.get()
        .collection("user")
        .findOne({ mobile: Number(data.mobile) })
        .then((result) => {
          if (result) {
            if (data.otp == otp) {
              resolve({ otpvalidated: true });
            } else {
              resolve({ otpvalidated: false });
            }
          } else {
            resolve({ usernotfound: true });
          }
        });
    });
  },
};

// <div class="toast show position-absolute top-4 d-flex justify-content-center align-items-center border-success border-4" style="height:10% ;" role="alert" aria-live="assertive" aria-atomic="true"   >

//            <div class="toast-body">
//             <h5 class="m-0 text-success"><%itemr%></h5>
//            </div>
//          </div>
