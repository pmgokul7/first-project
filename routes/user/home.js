const Razorpay = require("razorpay");
const express = require("express");
const route = express.Router();
const con = require("../../config/connection");
const cartHelpers = require("../../helpers/cartHelpers");


const productHelpers = require("../../helpers/ProductsHelpers")
const ordersHelpers = require("../../helpers/ordersHelpers")
const couponHelper = require("../../helpers/couponHelpers");
const profileHelper = require("../../helpers/profileHelpers");
const getWallet = require("../../helpers/getwalletUser");
const addressHelpers = require("../../helpers/addressHelpers")
const wishlistHelper = require("../../helpers/wishlistHelper");
const paymentHelper = require("../../helpers/paymentHelpers");
const homeHelpers = require("../../helpers/homeHelpers");


instance = new Razorpay({key_id: "rzp_test_kwZGFuI0hWeY2V", key_secret: "b4PuKMMLTh2w0HRjNrKe36Ax"});


route.get("/cart", (req, res) => {

    cartHelpers.getCartProducts(req).then(result => {

        res.render("user/cart", {result, user: req.session.user});
    }).catch((err) => {
        res.render("user/403")
    })


});

function nocache(req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
}
route.get("/", nocache, async (req, res) => {

    var result = await con.get().collection("Products").aggregate([
        {
            $match: {
                isDeleted: false
            }
        }, {
            $sort: {
                added: -1
            }
        }, {
            $limit: 9
        }
    ]).toArray()

    res.render("user/userHome", {
        user: req.session.user,
        result

    });


});

route.get("/products", async (req, res) => {
    productHelpers.getProducts(req).then(result => {
        res.render("user/products", {
            user: req.session.user,
            result: result.result
        });
    }).catch(() => {
        res.render("user/403")
    })

});


// product info

route.get("/products/info", (req, res) => {
    productHelpers.info(req).then(result => {
        console.log(result);
        res.render("user/info", {
            result: result.result,
            cart: result.ifres,
            user: req.session.user,
            wishlistp: result.wishlistp
        });
    }).catch(err => {
        res.render("user/403")
    })


});


// productsearch

route.post("/products", (req, res) => {
    productHelpers.productSearchHelper(req).then(r => {

        if (r.status == true) {
            res.render("user/products", {
                result: r.result,
                srarcsh: r.searcsh,
                user: req.session.user
            });
        } else {
            res.render("user/NofileError")
        }
    }).catch(err => {
        res.render("user/NofileError")
    })


});


// remove from cart

route.get("/cart/remove", async (req, res) => {
    await cartHelpers.removeFromCart2(req)
    res.redirect("/home/cart");
});


// user orders

route.get("/orders", (req, res) => {
    ordersHelpers.userOrders(req).then(result => {
        res.render("user/orders", {
            user: req.session.user,
            result: result.result,
            orderresult: result.orderResult
        });
    }).catch(err => {
        res.render("user/403")
    })

});


route.post("/addaddress/:id", (req, res) => {
    addressHelpers.addressAdd(req).then((result) => {
        res.send(result);
    });
});


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

route.get("/cart/checkout", (req, res) => {
    cartHelpers.cartCheckOut(req).then(r => {
        cartItems = r.cartItems;
        res.render("user/buynow2", {
            result: r.result,
            user: r.user,
            cartItems: r.cartItems
        });
    }).catch(err => {
        res.render("user/403")
    })


});

// user profile

route.get("/profile", (req, res) => {
    profileHelper.getProfile(req).then((result) => {
        res.render("user/profile", {result, user: req.session.user});
    }).catch(err => {
        res.render("user/403")
    })


});

// delete address

route.get("/deleteaddress", (req, res) => {
    addressHelpers.deleteAddress(req).then(() => {
        res.redirect("/home/myaddress");
    }).catch(err => {
        if (err) {
            res.render("user/404")
        }
    })
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
    wishlistHelper.getWishListHelper(req).then(r => {
        res.render("user/wislist", {
            r: r.r,
            user: req.session.user
        });
    }).catch((err) => {
        if (err) {
            res.render("user/403")
        }
    })


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
    res.send({result: result})


});
route.get("/failed", async (req, res) => {
    await paymentHelper.paymentFailed()
    res.render("user/paymentfailed");

});

// razorpay varify

route.post("/varifypayment", async (req, res) => {
    var result = await paymentHelper.razorpayVarify(req)
    if (result.status) {
        res.redirect("/orders")

    }

});
route.get("/cartsuccess", async (req, res) => {
    const result = await paymentHelper.paypalPaymentsuccess(req)
    res.render("user/success", {user: req.session.user});

});



// get cart total

route.post("/gettotal", async (req, res) => {
    var result = await cartHelpers.getCartTotal(req)
    if (result.total.length != 0) {
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
    codefromcart = req.body.ID;

    couponHelper.checkCode(req).then((result) => {
        console.log(result);
        if (result.couponFound == true) {
            coupondis = result.result;
            res.send(result);
        } else if (result.couponFound == false) {
            res.send(result);
        }
    });
});

// remove coupon

route.post("/removeCoupon", (req, res) => {
    couponHelper.removeCoupon(req);
});

// order info

route.get("/orderinfo/:id", (req, res) => {
    ordersHelpers.orderInfo(req).then(result => {

        console.log("orders", Date.parse(result.order[0].product.deliverytime));
        console.log("now", Date.now());
        var retunTime = Date.parse(result.order[0].product.deliverytime) - Date.now() < 604800000 ? true : false;
        console.log(Date.parse(result.order[0].product.deliverytime) - Date.now());
        console.log(retunTime);


        res.render("user/orderinfo", {
            user: req.session.user,
            order: result.order,
            discount: req.query.dis,
            retunTime
        });
    }).catch(err => {
        res.render("user/404")
    })


});
// "604800000"
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


route.get("/register", (req, res) => {
    var msg = req.flash("info");
    res.render("user/userRegister", {msg});
})

route.post("/sendFeedback", async (req, res) => {
    homeHelpers.feedbackHelper(req).then(result => {
        res.send(true)
    })
})

route.get("/logout", (req, res) => {
    req.session.userLogged = false;
    req.session.user = false;
    req.session.admin = false
    res.redirect("/home");
});


module.exports = route;
