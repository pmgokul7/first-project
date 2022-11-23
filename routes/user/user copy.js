const Razorpay = require("razorpay");
const crypto = require("crypto");
const express = require("express");
const {ObjectId} = require("mongodb");
const route = express.Router();
const con = require("../../config/connection");
const helper = require("../../helpers/buyProducts");
const cartHelpers = require("../../helpers/cartHelpers");

const bcrypt = require("bcrypt");
const paypal = require("paypal-rest-sdk");
const moment = require("moment");

const productHelpers=require("../../helpers/ProductsHelpers")
const ordersHelpers=require("../../helpers/ordersHelpers")
const couponHelper = require("../../helpers/couponHelpers");
const profileHelper = require("../../helpers/profileHelpers");
const getWallet = require("../../helpers/getwalletUser");
const searchProducts = require("../../helpers/productSearch");
const addressHelpers=require("../../helpers/addressHelpers")
const wishlistHelper = require("../../helpers/wishlistHelper");
const paymentHelper=require("../../helpers/paymentHelpers")


instance = new Razorpay({key_id: "rzp_test_kwZGFuI0hWeY2V", key_secret: "b4PuKMMLTh2w0HRjNrKe36Ax"});

route.use(function (req, res, next) {
    if (req.session.user && req.session.admin == false) {
        next();
    } else {
        res.redirect("/login");
    }
});

route.get("/cart", async (req, res) => {
   var result=await cartHelpers.getCartProducts(req)
        if (typeof coupondis == "undefined") {
            coupondis = 0;
        } else {
            coupondis = coupondis.discount;
        }
        res.render("user/cart", {result, user: req.session.user});
    
});


route.get("/", async (req, res) => {
   var result=await con.get().collection("Products").find().toArray()
     var categories=await   con.get().collection("categories").find().toArray()
            res.render("user/userHome", {
                user: req.session.user,
                result,
                categories
            });
        
    
});

route.get("/products", (req, res) => {
    res.render("user/products", {user: req.session.user});
});


route.get("/productss",async (req, res) => {
   var result=await productHelpers.searchByOs(req)
   res.render("user/products", {result:result.result, user: req.session.user});
    
});


route.get("/products/info",async(req, res) => {
   var result=await productHelpers.info(req)
        res.render("user/info", {
            result: result.result,
            cart: result.ifres,
            user: req.session.user,
            wishlistp: result.wishlistp
        });
    
});


// productsearch

route.post("/products",async (req, res) => {
   var r=await productHelpers.productSearchHelper(req)
        if (r) {
            res.render("user/products", {
                result: r.result,
                srarcsh: r.searcsh,
                user: req.session.user
            });
        }
    
});

// route.post("/productsfilter", (req, res) => {
//     console.log(req.body);
//     con.get().collection("Products").find({OS: req.body.os, brand: "*", RAM: "*"}).toArray().then((result) => {
//         res.render("user/products", {result, user: req.session.user});
//     });
// });

route.get("/cart/remove",async (req, res) => {
    await cartHelpers.removeFromCart2(req)
        res.redirect("/home/cart");
});

route.get("/orders", async(req, res) => {
   var result=await ordersHelpers.userOrders(req)
        res.render("user/orders", {
            user: req.session.user,
            result: result.result,
            orderresult: result.orderResult
        });
      
   
});

route.get("/checkout/:id", (req, res) => {
    helper.checkout(req).then((result) => {
        res.render("user/buynow", {
            result: result.result,
            user: result.user,
            price: req.query.price
        });
    });
});

route.post("/addaddress/:id", (req, res) => {
    console.log("add address called");
    helper.addressAdd(req).then((result) => {
        res.send(result);
        console.log("added address");
    });
});
route.post("/orderconfirm", (req, res) => {
    helper.confirmCODOrder(req).then((result) => {
        res.send(result);
    });
});

route.post("/orders/cancelorder", (req, res) => {
    helper.orderCancel(req).then((result) => {
        res.send(result);
    });
});

route.post("/info/removefromcart", async(req, res) => {
   var result=await cartHelpers.removeFromCart(req)
        res.send({result});
});
route.post("/info/addtocart", async(req, res) => {
   var result=await cartHelpers.addToCart(req)
        res.send(result.added);
    
});

route.get("/cart/checkout",async (req, res) => {
   var r=await cartHelpers.cartCheckOut(req)
        cartItems = r.cartItems;

        res.render("user/buynow2", {
            result: r.result,
            user: r.user,
            cartItems: r.cartItems
        });
  
});

route.get("/profile", (req, res) => {
    profileHelper.getProfile(req).then((result) => {
        console.log(result);
        res.render("user/profile", {result, user: req.session.user});
    });
});

route.get("/deleteaddress",async (req, res) => {
 await addressHelpers.deleteAddress(req)
        res.redirect("/home/myaddress");
 
});

route.post("/addtowish", (req, res) => {

    wishlistHelper.addToWishHelper(req).then((r) => {
        res.send({added: r.added});
    });
});

route.post("/removefromwish",async (req, res) => {
 var r= await  wishlistHelper.removeFromWishHelper(req)
        res.send({removed: r.removed});
});

route.get("/wishlist", async(req, res) => {
   var r= await wishlistHelper.getWishListHelper(req)
        res.render("user/wislist", {
            r: r.r,
            user: req.session.user
        });
   
});

route.get("/success", (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    const execute_payment_json = {
        payer_id: payerId,
        transactions: [
            {
                amount: {
                    currency: "USD"
                }
            },
        ]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) { // When error occurs when due to non-existent transaction, throw an error else log the transaction details in the console then send a Success string reposponse to the user.
        if (error) {
            console.log(error.response);
            throw error;
        } else { 
            res.send("Success");
        }
    });

    res.render("user/paymentsuccess", {user: req.session.user});
});

route.get("/changepassword", (req, res) => {
    msg = req.flash("msg");

    res.render("user/changepassword", {msg, user: req.session.user});
});

route.post("/changepass", (req, res) => {
    if (req.body.oldpass == "" || req.body.newpass == "" || req.body.repeatpass == "") {
        res.send({status: "empty"});
    } else {
        con.get().collection("user").findOne({
            _id: ObjectId(req.session.user._id)
        }).then((result) => { // console.log(req.body);

            if (result) {
                bcrypt.compare(req.body.oldpass, result.password).then((compareresult) => {
                    if (compareresult == true) {
                        console.log("old and new password match");
                        bcrypt.hash(req.body.newpass, 10).then((hashedPass) => {
                            con.get().collection("user").updateOne({
                                _id: ObjectId(req.session.user._id)
                            }, {
                                $set: {
                                    password: hashedPass
                                }
                            }).then(() => {
                                console.log("updated successfully");
                                res.send({status: "updated"});
                            });
                        });
                    } else {
                        res.send({status: "error"});
                        console.log("old and new password wont match");
                    }
                });
            } else {
                res.redirect("/login");
            }
        });
    }
});

route.post("/changeQuantity", (req, res) => {
    cartHelpers.changeProQuantity(req).then((result) => {
        res.send(result);
    });
});

route.post("/addressadd/:id", (req, res) => {
    console.log("called");
});

route.post("/orderconfirmcart", async (req, res) => {
 var result=await paymentHelper.COD(req)
 res.send({status:result.status})
    // console.log("this is order cod body", req.body);
    // var total = cartTotal[0].total -(cartTotal[0].total * req.body.discount) / 100;
    // var user = await con.get().collection("user").findOne({
    //     _id: ObjectId(req.session.user._id)
    // });

    // var products = [];
    // con.get().collection("cart").findOne({
    //     user: ObjectId(req.session.user._id)
    // }).then((re) => {
    //     console.log("current walletbalance is,", req.session.user.wallet);
    //     var walletbalance = req.session.user.wallet;
    //     products = re.products;
    //     products.map((s) => {
    //         s.status = "placed";
    //     });
    //     if (req.body.usewallet2 == "true") {
    //         newwalletbalance = walletbalance;
    //     } else {
    //         newwalletbalance = 0;
    //     }
    //     console.log("d", typeof req.body.usewallet2);
    //     console.log("d", walletbalance);
    //     console.log("d", newwalletbalance);
    //     con.get().collection("orders").insertOne({
    //         product: products,
    //         user: req.session.user.name,
    //         method: "COD",
    //         status: "placed",
    //         paymentstatus: "success",
    //         address: JSON.parse(req.body.address),
    //         time: moment().format("L"),
    //         date: moment().toDate(),
    //         coupon: req.body.ID,
    //         walletAmount: total - (total - newwalletbalance < 0 ? 0 : total - newwalletbalance),
    //         discount: req.body.discount,
    //         quantity: 1,
    //         total: total - newwalletbalance < 0 ? 0 : total - newwalletbalance
    //     }).then((inserted) => { // con.get().collection("cart").aggregate([{$match:{user:ObjectId(req.session.userId)}},{$unwind:$products}])
    //         products.map((prod) => {
    //             con.get().collection("Products").updateOne({
    //                 _id: ObjectId(prod.product)
    //             }, {
    //                 $inc: {
    //                     stock: -prod.count
    //                 }
    //             }).then(() => {
    //                 console.log("quantity changed");
    //             });
    //         });
    //         insId = inserted.insertedId;
    //         con.get().collection("cart").updateOne({
    //             user: ObjectId(req.session.user._id)
    //         }, {
    //             $set: {
    //                 products: []
    //             }
    //         }).then(async () => {
    //             con.get().collection("coupons").findOne({ID: req.body.ID}).then(async (id) => {
    //                 if (id) {
    //                     con.get().collection("coupons").updateOne({
    //                         ID: req.body.ID
    //                     }, {
    //                         $push: {
    //                             users: req.session.user._id
    //                         },
    //                         $inc: {
    //                             count: -1
    //                         }
    //                     }).then((idr) => {
    //                         console.log("here user is pushed to the coupon");
    //                     });
    //                 }
    //                 order = await con.get().collection("orders").findOne({_id: insId});
    //                 console.log("this is order");
    //                 con.get().collection("user").updateOne({
    //                     _id: ObjectId(req.session.user._id)
    //                 }, {
    //                     $inc: {
    //                         wallet: -(total - order.total)
    //                     }
    //                 });
    //                 // con.get().collection("Products").updateOne()

    //                 console.log("cart is empty ");
    //                 res.send({status: "success"});
    //             });
    //         });
    //     });
    // });
    // console.log("this is cart products", cartProducts[0].p[0]);
    // var sumCount = 0;

    // })
});

route.post("/cartPayment", async (req, res) => {

var result=await paymentHelper.paymentHelper(req)
console.log("booooooooooooom",result);
res.send({result:result})

   
});
route.get("/failed", (req, res) => {
    // items.map((s) => {
    //     con.get().collection("orders").updateOne({
    //         _id: s
    //     }, {
    //         $set: {
    //             paymentstatus: "failed",
    //             status: "pending"
    //         }
    //     }).then((result) => {
    //         console.log(result);
    //         res.render("user/paymentfailed");
    //     });
    // });

    res.render("user/paymentfailed");
    // con.get().collection("orders").updateOne({ _id: globalobjid },{ $set: { paymentstatus: "failed", status: "pending" } }).then(()=>{
    // res.render("user/paymentfailed")
    // })
});

route.post("/varifypayment", async(req, res) => {
  var result= await paymentHelper.razorpayVarify(req)
  if(result.status){
    res.render("user/success",{user:req.session.user});

  }
    // let hmac = crypto.createHmac("sha256", "b4PuKMMLTh2w0HRjNrKe36Ax");
    // hmac.update(req.body["payment[razorpay_order_id]"] + "|" + req.body["payment[razorpay_payment_id]"]);
    // hmac = hmac.digest("hex");
    // if (hmac == req.body["payment[razorpay_signature]"]) {
    //     console.log("payment is success");
    //     console.log("gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg", razorid);
    //     con.get().collection("orders").updateOne({
    //         _id: razorid
    //     }, {
    //         $set: {
    //             status: "placed",
    //             paymentstatus: "success",
    //             "product.$[].status": "placed"
    //         }
    //     }).then((e) => {
    //         console.log("lkjhgfdsdfghjklkjhgfd", e);

    //         products.map((prod) => {
    //             con.get().collection("Products").updateOne({
    //                 _id: ObjectId(prod.product)
    //             }, {
    //                 $inc: {
    //                     stock: -prod.count
    //                 }
    //             }).then(() => {
    //                 console.log("quantity changed");
    //             });
    //         });
    //     });

    //     con.get().collection("cart").updateOne({
    //         user: ObjectId(req.session.user._id)
    //     }, {
    //         $set: {
    //             products: []
    //         }
    //     }).then((r) => {
    //         con.get().collection("user").updateOne({
    //             _id: ObjectId(req.session.user._id)
    //         }, {
    //             $inc: {
    //                 wallet: -(total -(total - walletbalanc < 0 ? 0 : total - walletbalanc))
    //             }
    //         })
    //         console.log("cart is empty");
    //     });
    //     res.render("user/success");
    // } else {
        // console.log("payment is failed");
        // items2.map((s) => {
        //     con.get().collection("orders").updateOne({
        //         _id: s
        //     }, {
        //         $set: {
        //             status: "failed payment",
        //             paymentstatus: "failed"
        //         }
        //     }).then((d) => {
        //         console.log(d);
        //         // console.log("payment is failed");
        //     });
        // });
    // }
});
route.get("/cartSuccess",async (req, res) => {
   await paymentHelper.paypalPaymentsuccess(req)
    res.render("user/success", {user: req.session.user});
    // con.get().collection("orders").updateOne({
    //     _id: ObjectId(cartpaypalid)
    // }, {
    //     $set: {
    //         paymentstatus: "success",
    //         status: "placed",
    //         "product.$[].status": "placed"
    //     }
    // }).then((result) => {
    //     products.map((prod) => {
    //         con.get().collection("Products").updateOne({
    //             _id: ObjectId(prod.product)
    //         }, {
    //             $inc: {
    //                 stock: -prod.count
    //             }
    //         }).then(() => {
    //             con.get().collection("user").updateOne({
    //                 _id: ObjectId(req.session.user._id)
    //             }, {
    //                 $inc: {
    //                     wallet: -(total -(total - walletbalanc < 0 ? 0 : total - walletbalanc))
    //                 }
    //             })
    //             console.log("quantity changed");
    //         });
    //     });
        
    // });

    // con.get().collection("cart").updateOne({
    //     user: ObjectId(req.session.user._id)
    // }, {
    //     $set: {
    //         products: []
    //     }
    // }).then((r) => {
    //     console.log("after cart empty", r);
    //     console.log("cart is empty");
    // });
    // res.render("user/success", {user: req.session.user});
});
route.post("/gettotal", (req, res) => {
    con.get().collection("cart").aggregate([
        {
            $match: {
                user: ObjectId(req.session.user._id)
            }
        },
        {
            $unwind: "$products"
        },

        {
            $lookup: {
                from: "Products",
                localField: "products.product",
                foreignField: "_id",
                as: "pro"
            }
        },
        {
            $project: {
                "products.product": 1,
                "products.count": 1,
                pro: {
                    $arrayElemAt: ["$pro", 0]
                }
            }
        }, {
            $group: {
                _id: null,
                total: {
                    $sum: {
                        $multiply: ["$products.count", "$pro.offerprice"]
                    }
                }
            }
        },
    ]).toArray().then((total) => {
        con.get().collection("cart").aggregate([
            {
                $match: {
                    user: ObjectId(req.session.user._id)
                }
            },
            {
                $unwind: "$products"
            },

            {
                $lookup: {
                    from: "Products",
                    localField: "products.product",
                    foreignField: "_id",
                    as: "pro"
                }
            },
            {
                $project: {
                    "products.product": 1,
                    "products.count": 1,
                    pro: {
                        $arrayElemAt: ["$pro", 0]
                    }
                }
            }, {
                $project: {
                    total: {
                        $sum: {
                            $multiply: ["$products.count", "$pro.offerprice"]
                        }
                    }
                }
            },
        ]).toArray().then((eachsum) => {
            cartTotal = total;
            res.send(total);
            console.log(eachsum);
        });
    });
});

route.get("/removeFromCart/:id", (req, res) => {
    con.get().collection("cart").updateOne({
        user: ObjectId(req.session.user._id)
    }, {
        $pull: {
            products: {
                product: ObjectId(req.params.id)
            }
        }
    }).then((r) => {
        console.log(r);
        res.redirect("/home/cart");
    });
    console.log(req.params);
});

route.get("/editaddress", async(req, res) => {
 const result= await addressHelpers.editAddress(req)
 res.render("user/editAddress", {
  user: req.session.user,
  address:result.address
});
    // con.get().collection("user").findOne({
    //     _id: ObjectId(req.session.user._id)
    // }).then((add) => { // console.log(user.address[req.query.i]);
    //     address = add.address[req.query.i];
    //     res.render("user/editAddress", {
    //         user: req.session.user,
    //         address
    //     });
    // });
});

route.post("/couponcheck", (req, res) => {
    console.log(req.body);
    codefromcart = req.body.ID;
    couponHelper.checkCode(req).then((result) => {
        if (result.couponFound == true) {
            console.log(result);
            coupondis = result.result;
            res.send(result);
        } else if (result.couponFound == false) {
            console.log(result);
            res.send(result);
        }
    });
});

route.post("/removeCoupon", (req, res) => {
    couponHelper.removeCoupon(req);
});
route.get("/orderinfo/:id", async(req, res) => {
    console.log(req.body);
   const order = await con.get().collection("orders").aggregate([
        {
            $match: {
                _id: ObjectId(req.params.id)
            }
        }, {
            $unwind: "$product"
        }, {
            $lookup: {
                from: "Products",
                localField: "product.product",
                foreignField: "_id",
                as: "pp"
            }
        },
    ]).toArray()
        
        res.render("user/orderinfo", {
            user: req.session.user,
            order,
            discount: req.query.dis
        });
   
});

route.get("/getwallet", (req, res) => {
    getWallet.getWallet(req).then((user) => {
        if (user) {
            res.render("user/mywallet", {
                user: user.user,
                wallet: user.wallet
            });
        }
    });
});

route.get("/myaddress",async (req, res) => {
  var user=await addressHelpers.myAddress(req).then(()=>{
res.render("user/myaddress", {user:user.user});
  })
  
        
   
});

// delete from order
route.post("/deletefrombulkorder", async (req, res) => {
    if (req.body.discount == "") {
        disc = 0;
    } else {
        disc = req.body.discount;
    }
    console.log("this is body from cancel order", req.body);
    var e = await con.get().collection("orders").updateOne({
        _id: ObjectId(req.body.id),
        "product.product": ObjectId(req.body.model)
    }, {
        $set: {
            "product.$.status": "cancelled"
        }
    })
    if (e.modifiedCount != 0) {
        res.send({cancelled: true});
        var pro = await con.get().collection("Products").findOne({
            _id: ObjectId(req.body.model)
        })
        if (pro) {
            walletAmount = Number(req.body.count) * parseInt(pro.offerprice) - (parseInt(pro.offerprice) * parseInt(disc)) / 100;
            console.log("this is wallet amount", walletAmount);
            if (req.body.method != "COD") {
                await con.get().collection("user").updateOne({
                    _id: ObjectId(req.session.user._id)
                }, {
                    $inc: {
                        wallet: Number(req.body.amounttoreturn)
                    }
                });
                await con.get().collection("wallet").insertOne({
                    user: ObjectId(req.session.user._id),
                    type: "credit",
                    amount: Number(req.body.amounttoreturn),
                    product: `cancellation of ${
                        req.body.name
                    }`,
                    date: new Date().toLocaleString()
                });
            }

            await con.get().collection("Products").updateOne({
                _id: ObjectId(req.body.model)
            }, {
                $inc: {
                    stock: parseInt(req.body.count)
                }
            })
        }

    } else {
        res.send({cancelled: false});
    }

});


route.post("/returnproduct", async (req, res) => {
    var result=await ordersHelpers.returnProducts(req)
    // const order = await con.get().collection("orders").findOne({
    //     _id: ObjectId(req.body.id),
    //     "product.product": ObjectId(req.body.model)
    // })
    // await con.get().collection("orders").updateOne({
    //     _id: ObjectId(req.body.id),
    //     "product.product": ObjectId(req.body.model)
    // }, {
    //     $set: {
    //         "product.$.status": "returned"
    //     }
    // })
    // console.log(order);
    // await con.get().collection("user").updateOne({
    //     _id: ObjectId(req.session.user._id)
    // }, {
    //     $inc: {
    //         wallet: order.walletAmount + order.total
    //     }
    // })
    res.send({return: result.return})

    // con
    // .get()
    // .collection("return")
    // .insertOne({
    //     order: ObjectId(req.body.id),
    //     model: ObjectId(req.body.model),
    // })
    // .then((r) => {
    //     console.log(r);
    //     con
    //       .get()
    //       .collection("orders")
    //       .updateOne(
    //         {
    //           user: req.session.user.name,
    //           "product.product": ObjectId(req.body.model),
    //         },
    //         { $push: { product: { status: "return" } } }
    //       );
    //     res.send({ return: true });
    // });
});

route.post("/payfromwallet", async (req, res) => {
  var result= await paymentHelper.payFromWallet(req)
   res.send({status:result.status});
    // console.log("this is order cod body", req.body);
    // var total = cartTotal[0].total -(cartTotal[0].total * req.body.discount) / 100;
    // var user = await con.get().collection("user").findOne({
    //     _id: ObjectId(req.session.user._id)
    // });
    // var products = [];
    // let re = await con.get().collection("cart").findOne({
    //     user: ObjectId(req.session.user._id)
    // })
    // console.log("current walletbalance is,", req.session.user.wallet);
    // var walletbalance = req.session.user.wallet;
    // products = re.products;
    // products.map((s) => {
    //     s.status = "placed";
    // });
    // if (req.body.usewallet3 == "true") {
    //     newwalletbalance = walletbalance;
    // } else {
    //     newwalletbalance = 0;
    // }

    // inserted = await con.get().collection("orders").insertOne({
    //     product: products,
    //     user: req.session.user.name,
    //     method: "wallet",
    //     status: "placed",
    //     paymentstatus: "success",
    //     address: JSON.parse(req.body.address),
    //     time: moment().format("L"),
    //     date: moment().toDate(),
    //     coupon: req.body.ID,
    //     walletAmount: total - (total - newwalletbalance < 0 ? 0 : total - newwalletbalance),
    //     discount: req.body.discount,
    //     quantity: 1,
    //     total: total
    // })
    // insId = inserted.insertedId;
    // await con.get().collection("cart").updateOne({
    //     user: ObjectId(req.session.user._id)
    // }, {
    //     $set: {
    //         products: []
    //     }
    // })
    // var id = await con.get().collection("coupons").findOne({ID: req.body.ID})
    // if (id) {
    //     await con.get().collection("coupons").updateOne({
    //         ID: req.body.ID
    //     }, {
    //         $push: {
    //             users: req.session.user._id
    //         },
    //         $inc: {
    //             count: -1
    //         }
    //     })
    //     console.log("here user is pushed to the coupon");

    // }
    // order = await con.get().collection("orders").findOne({_id: insId});
    // console.log("this is order");
    // console.log(total - order.total);
    // await con.get().collection("user").updateOne({
    //     _id: ObjectId(req.session.user._id)
    // }, {
    //     $inc: {
    //         wallet: - total
    //     }
    // })
    // await con.get().collection("wallet").insertOne({
    //     user: ObjectId(req.session.user._id),
    //     amount: total,
    //     type: "debit",
    //     date: new Date().toLocaleString()
    // });


    // console.log("cart is empty ");
    // res.send({status: "success"});


    // console.log("this is cart products", cartProducts[0].p[0]);
    // var sumCount = 0;
});

module.exports = route;
