const db = require("../config/connection");
const bcrypt = require("bcrypt");
const {request} = require("express");
const myref = require("otp-generators");
const collectionNames = require("../config/collectionNames")
const {ObjectId} = require("mongodb");
// const otpgen=require("otpGenerators")
module.exports = {
    userloginValidator: (data) => {
        return new Promise(async (resolve, reject) => {
            const result = await db.get().collection(collectionNames.USER_COLLECTION).findOne({mobile: data.mobile})

            if (result) {
                const compareRes = await bcrypt.compare(data.password, result.password)

                if (compareRes == true && data.mobile == result.mobile && result.status == "active") {
                    resolve({loginstatus: true, blocked: false, result, admin: false});
                } else if (compareRes == true && data.mobile == result.mobile && result.status == "block") {
                    resolve({loginstatus: false, blocked: true});
                } else {
                    resolve({loginstatus: false, blocked: true});
                }

            } else {
                resolve({loginstatus: false, userfound: false});
            }

        });
    },

    userOtpValidator: () => {
        return new Promise((resolve, reject) => {});
    },

    userSignupValidator: (data) => {
        return new Promise(async (resolve, reject) => {
            const myreferal = myref.generate(5, {
                alphabets: true,
                upperCase: true,
                specialChar: false
            });
            const result = await db.get().collection(collectionNames.USER_COLLECTION).findOne({
                mobile: Number(data.mobile)
            })
            if (result != null) {
                resolve({emailfound: true});
            } else {
                const hashedpass = await bcrypt.hash(data.password, 10)
                hashedpass.toString();
                const r = await db.get().collection("user").insertOne({
                    name: data.user,
                    mobile: data.mobile,
                    email: data.email,
                    password: hashedpass,
                    status: "active",
                    myreferal: myreferal,
                    referal: data.referal,
                    referalusers: [],
                    wallet: 0
                })

                insertedId = r.insertedId
                if (data.referal != "") {
                    const user = await db.get().collection(collectionNames.USER_COLLECTION).findOne({myreferal: data.referal})

                    if (user) {
                        await db.get().collection("user").updateOne({
                            _id: ObjectId(user._id)
                        }, {
                            $set: {
                                wallet: user.wallet + 50
                            },
                            $push: {
                                referalusers: insertedId
                            }
                        })


                        resolve({Signupstatus: true});

                    }

                }


            }

        });
    },
    adminLoginValidator: (data) => {
        return new Promise(async (resolve, reject) => {
            const result = await db.get().collection("admins").findOne({username: data.mobile})
            if (result) {
                const compareres = await bcrypt.compare(data.password, result.password)
                if (compareres == true && data.mobile == result.username) {
                    resolve({adminlogged: true});
                    console.log("admin true");
                } else {
                    resolve({adminlogged: false});
                    console.log("admin false");
                }

            } else {
                resolve({adminlogged: false, adminfound: false});
                console.log("admin not found");
            }

        });
    },
    otploginvalidator: (data, otp) => {
        return new Promise(async (resolve, request) => {
            const result = await db.get().collection("user").findOne({
                mobile: Number(data.mobile)
            })
            if (result) {
                if (data.otp == otp) {
                    resolve({otpvalidated: true});
                } else {
                    resolve({otpvalidated: false});
                }
            } else {
                resolve({usernotfound: true});
            }

        });
    },
    userRegister: (data) => {
        return new Promise(async (resolve, reject) => {
            const result = await db.get().collection("user").findOne({
                $or: [
                    {
                        mobile: req.body.mobile
                    }, {
                        email: req.body.email
                    }
                ]
            })
            if (data.body.user == "" || data.body.mobile == "" || data.body.email == "" || data.body.password == "" || data.body.confirm == "") {
                resolve({empty: true})

            } else if (data.body.password != data.body.confirm) {
                resolve({confirm: true})

            } else if (result) {
                resolve({alreadyUsed: true})

            } else {
                helper.userSignupValidator(req.body).then(() => {
                    resolve({registered: true})
                    console.log("regsitered");
                    req.flash("info2", "user registered successfully");
                    res.redirect("/login");
                });
            }

        })
    }
};
