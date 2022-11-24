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

const productHelpers = require("../../helpers/ProductsHelpers")
const ordersHelpers = require("../../helpers/ordersHelpers")
const couponHelper = require("../../helpers/couponHelpers");
const profileHelper = require("../../helpers/profileHelpers");
const getWallet = require("../../helpers/getwalletUser");
const addressHelpers = require("../../helpers/addressHelpers")
const wishlistHelper = require("../../helpers/wishlistHelper");
const paymentHelper = require("../../helpers/paymentHelpers")


instance = new Razorpay({key_id: "rzp_test_kwZGFuI0hWeY2V", key_secret: "b4PuKMMLTh2w0HRjNrKe36Ax"});

// route.use(function (req, res, next) {
//     if (req.session.user && req.session.admin == false) {
//         next();
//     } else {
//         res.redirect("/home");
//     }
// });


route.get("/cart", async (req, res) => {

    var result = await cartHelpers.getCartProducts(req)
    if (typeof coupondis == "undefined") {
        coupondis = 0;
    } else {
        coupondis = coupondis.discount;
    }
    res.render("user/cart", {result, user: req.session.user});

});


route.get("/", async (req, res) => {
    var result = await con.get().collection("Products").find({isDeleted:false}).toArray()
    var categories = await con.get().collection("categories").find().toArray()
    res.render("user/userHome", {
        user: req.session.user,
        result,
        categories
    });


});

route.get("/products", async(req, res) => {
// console.log("hai");
    const result=await con.get().collection("Products").aggregate([{$match:{isDeleted:false}}]).toArray()
    res.render("user/products", {user: req.session.user,result});
});


route.get("/productss", async (req, res) => {
    var result = await productHelpers.searchByOs(req)
    res.render("user/products", {
        result: result.result,
        user: req.session.user
    });

});


// product info

route.get("/products/info", async (req, res) => {
    var result = await productHelpers.info(req)
    res.render("user/info", {
        result: result.result,
        cart: result.ifres,
        user: req.session.user,
        wishlistp: result.wishlistp
    });

});


// productsearch

route.post("/products", async (req, res) => {
    var r = await productHelpers.productSearchHelper(req)
    console.log("hau",r);
    if (r) {
        res.render("user/products", {
            result: r.result,
            srarcsh: r.searcsh,
            user: req.session.user
        });
    }

});


// remove from cart

route.get("/cart/remove", async (req, res) => {
    await cartHelpers.removeFromCart2(req)
    res.redirect("/home/cart");
});


// user orders

route.get("/orders", async (req, res) => {
    var result = await ordersHelpers.userOrders(req)
    res.render("user/orders", {
        user: req.session.user,
        result: result.result,
        orderresult: result.orderResult
    });
});


// route.get("/checkout/:id", (req, res) => {
//     helper.checkout(req).then((result) => {
//         res.render("user/buynow", {
//             result: result.result,
//             user: result.user,
//             price: req.query.price
//         });
//     });
// });


// route.post("/addaddress/:id", (req, res) => {
//     console.log("add address called");
//     helper.addressAdd(req).then((result) => {
//         res.send(result);
//         console.log("added address");
//     });
// });

// route.post("/orderconfirm", (req, res) => {
//     helper.confirmCODOrder(req).then((result) => {
//         res.send(result);
//     });
// });

// route.post("/orders/cancelorder", (req, res) => {
//     helper.orderCancel(req).then((result) => {
//         res.send(result);
//     });
// });


// remove from cart

route.post("/info/removefromcart", async (req, res) => {
    var result = await cartHelpers.removeFromCart(req)
    res.send({result});
});

// add to cart

route.post("/info/addtocart", async (req, res) => {
    var result = await cartHelpers.addToCart(req)
    res.send(result.added);

});

// cart checkout

route.get("/cart/checkout", async (req, res) => {
    var r = await cartHelpers.cartCheckOut(req)
    cartItems = r.cartItems;

    res.render("user/buynow2", {
        result: r.result,
        user: r.user,
        cartItems: r.cartItems
    });

});

// user profile

route.get("/profile", (req, res) => {
    profileHelper.getProfile(req).then((result) => {
        console.log(result);
        res.render("user/profile", {result, user: req.session.user});
    });
});

// delete address

route.get("/deleteaddress", async (req, res) => {
    await addressHelpers.deleteAddress(req)
    res.redirect("/home/myaddress");

});

// add to wishlist

route.post("/addtowish", (req, res) => {
    wishlistHelper.addToWishHelper(req).then((r) => {
        res.send({added: r.added});
    });
});

// remove from wishlist

route.post("/removefromwish", async (req, res) => {
    var r = await wishlistHelper.removeFromWishHelper(req)
    res.send({removed: r.removed});
});

// get wishlist

route.get("/wishlist", async (req, res) => {
    var r = await wishlistHelper.getWishListHelper(req)
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

// change password form

route.get("/changepassword", (req, res) => {
    msg = req.flash("msg");

    res.render("user/changepassword", {msg, user: req.session.user});
});

// change password

route.post("/changepass", async (req, res) => {
    var result = await profileHelper.changePassword(req)
    res.send({status: result.status})

    console.log(result);
    // if(result.status!="redirect"){
    //     res.send(result.status)
    // }  else{
    //     res.redirect("/login")
    // }
    // if (req.body.oldpass == "" || req.body.newpass == "" || req.body.repeatpass == "") {
    //     res.send({status: "empty"});
    // } else {
    //     con.get().collection("user").findOne({
    //         _id: ObjectId(req.session.user._id)
    //     }).then((result) => { // console.log(req.body);

    //         if (result) {
    //             bcrypt.compare(req.body.oldpass, result.password).then((compareresult) => {
    //                 if (compareresult == true) {
    //                     console.log("old and new password match");
    //                     bcrypt.hash(req.body.newpass, 10).then((hashedPass) => {
    //                         con.get().collection("user").updateOne({
    //                             _id: ObjectId(req.session.user._id)
    //                         }, {
    //                             $set: {
    //                                 password: hashedPass
    //                             }
    //                         }).then(() => {
    //                             console.log("updated successfully");
    //                             res.send({status: "updated"});
    //                         });
    //                     });
    //                 } else {
    //                     res.send({status: "error"});
    //                     console.log("old and new password wont match");
    //                 }
    //             });
    //         } else {
    //             res.redirect("/login");
    //         }
    //     });
    // }
});

// change cart quantity

route.post("/changeQuantity", (req, res) => {
    cartHelpers.changeProQuantity(req).then((result) => {
        res.send(result);
    });
});


// COD from cart

route.post("/orderconfirmcart", async (req, res) => {
    var result = await paymentHelper.COD(req)
    res.send({status: result.status})

});


// online payment from cart

route.post("/cartPayment", async (req, res) => {
    var result = await paymentHelper.paymentHelper(req)
    console.log("booooooooooooom", result);
    res.send({result: result})


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

// razorpay varify

route.post("/varifypayment", async (req, res) => {
    var result = await paymentHelper.razorpayVarify(req)
    if (result.status) {
        res.render("user/success", {user: req.session.user});

    }

});
route.get("/cartSuccess", async (req, res) => {
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

// get cart total

route.post("/gettotal", async (req, res) => {
    var result = await cartHelpers.getCartTotal(req)
    if(result){
        res.send({total: result.total[0].total})
    }
    
});


// edit address
route.get("/editaddress", async (req, res) => {
    const result = await addressHelpers.editAddress(req)
    res.render("user/editAddress", {
        user: req.session.user,
        address: result.address
    });

});

// check coupon
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

// remove coupon

route.post("/removeCoupon", (req, res) => {
    couponHelper.removeCoupon(req);
});

// order info

route.get("/orderinfo/:id", async (req, res) => {
    console.log(req.body);
    var result = await ordersHelpers.orderInfo(req)
    res.render("user/orderinfo", {
        user: req.session.user,
        order: result.order,
        discount: req.query.dis
    });


});

// get wallet

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

// get addresses

route.get("/myaddress", async (req, res) => {
    var result = await addressHelpers.myAddress(req)
    console.log("uuussseerrr", result);
    res.render("user/myaddress", {user: result.user});


});

// delete from order
route.post("/deletefrombulkorder", async (req, res) => {
    var result = await ordersHelpers.cancelOrders(req)
    res.send({cancelled: result.cancelled})

});

// return product

route.post("/returnproduct", async (req, res) => {
    var result = await ordersHelpers.returnProducts(req)

    res.send({return: result.return})

});

// pay from wallet

route.post("/payfromwallet", async (req, res) => {
    var result = await paymentHelper.payFromWallet(req)
    res.send({status: result.status});

});

route.post("/cartwithoutlogin", (req, res) => {
    req.session.redirectUrl = req.body.originalUrl
    console.log(req.url);
    console.log(req.originalUrl);

    console.log(req.baseUrl);


})


route.get("/register", (req, res) => {
    var msg = req.flash("info");
    res.render("user/userRegister", {msg});
})

route.post("/sendMail",async(req,res)=>{
const status=await con.mail(req.body)
if(status.status==true){
    res.send(status.status)
    console.log("message send");
}
})

module.exports = route;
