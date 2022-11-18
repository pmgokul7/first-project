const { Router } = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const express = require("express");
const { ObjectId, ObjectID, Db } = require("mongodb");
const route = express.Router();
const con = require("../../config/connection");
const helper = require("../../helpers/buyProducts");
const addToCart = require("../../helpers/addTocart");
const removeFromCart = require("../../helpers/removeFromCart");
const removeFromCart2 = require("../../helpers/removeFromCart2");
// const showCart = require("../../helpers/showCart");
const bcrypt = require("bcrypt");
const paypal = require("paypal-rest-sdk");
const moment = require("moment");
const carthelper = require("../../helpers/cartHelper");
const cartHelper = require("../../helpers/cartHelper");

const couponHelper = require("../../helpers/couponHelpers");
const profileHelper = require("../../helpers/profileHelpers");
const getWallet=require("../../helpers/getwalletUser")
const searchProducts=require("../../helpers/productSearch")
const cartCheckOut=require("../../helpers/cartCheckout")
const addToWish=require("../../helpers/addToWish")
const removeFromWish=require("../../helpers/removeFromWish")
const getWishlist=require("../../helpers/getWishList");
const { type } = require("os");

instance = new Razorpay({
  key_id: "rzp_test_kwZGFuI0hWeY2V",
  key_secret: "b4PuKMMLTh2w0HRjNrKe36Ax",
});

route.use(function (req, res, next) {
  if (req.session.user && req.session.admin == false) {
    next();
  } else {
    res.redirect("/login");
  }
});

route.get("/cart", (req, res) => {
  carthelper.getCartProducts(req).then((result) => {
    if (typeof coupondis == "undefined") {
      coupondis = 0;
    } else {
      coupondis = coupondis.discount;
    }
    res.render("user/cart", { result, user: req.session.user });
  });
});
route.get("/", async(req, res) => {
 con.get().collection("Products").find().toArray().then(result=>{
  con.get().collection("categories").find().toArray().then(categories=>{
    res.render("user/userHome", { user: req.session.user,result,categories });
  })
  
 })
  
});

route.get("/products", (req, res) => {
  res.render("user/products", { user: req.session.user });
});
route.get("/products/:os", (req, res) => {
  console.log(req.params);
  con.get().collection("Products").find({OS:req.params.os}).toArray().then((result)=>{
    res.render("user/products", { result,user: req.session.user });
  })
  
});

route.get("/products/info", (req, res) => {
  helper.info(req).then((result) => {
    res.render("user/info", {
      result: result.result,
      cart: result.ifres,
      user: req.session.user,
      wishlistp: result.wishlistp,
    });
  });
});

//productsearch

route.post("/products", (req, res) => {
searchProducts.productSearchHelper(req).then(r=>{
  if(r){
    res.render("user/products", {
      result:r.result,
      srarcsh:r.searcsh,
      user: req.session.user,
    });
  
  }
})
});

route.post("/productsfilter",(req,res)=>{
  console.log(req.body);
  con.get().collection("Products").find({OS:req.body.os,brand:"*",RAM:"*"}).toArray().then((result)=>{
    res.render("user/products", { result,user: req.session.user });
   
  })

  
})


route.get("/cart/remove", (req, res) => {
  removeFromCart2.removeFromCart2(req).then(() => {
    res.redirect("/home/cart");
  });
});

route.get("/orders", (req, res) => {
  helper.myOrders(req).then((result) => {
    console.log("result",result);
    res.render("user/orders", {  user: req.session.user,result:result.result,orderresult:result.orderResult });
    console.log("ooooooooooooooooooooooooooooooooooo",result.orderResult);
  });
});

route.get("/checkout/:id", (req, res) => {
  helper.checkout(req).then((result) => {
    res.render("user/buynow", {
      result: result.result,
      user: result.user,
      price: req.query.price,
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

route.post("/info/removefromcart", (req, res) => {
  removeFromCart.removeFromCart(req).then((result) => {
    res.send({ result });
  });
});
route.post("/info/addtocart", (req, res) => {
  addToCart.addToCart(req).then((result) => {
    res.send(result.added);
  });
});

route.get("/cart/checkout", (req, res) => {
cartCheckOut.cartCheckOut(req).then(r=>{
  cartItems=r.cartItems

  res.render("user/buynow2", {
    result:r.result,
    user:r.user,
    cartItems:r.cartItems,
  });
})
});

route.get("/profile", (req, res) => {
  profileHelper.getProfile(req).then((result) => {
    console.log(result);
    res.render("user/profile", { result, user: req.session.user });
  });
});

route.get("/deleteaddress", (req, res) => {
  con
    .get()
    .collection("user")
    .updateOne({ _id: ObjectId(req.session.user._id) }, [
      {
        $set: {
          address: {
            $concatArrays: [
              { $slice: ["$address", parseInt(req.query.in)] },
              {
                $slice: [
                  "$address",
                  { $add: [1, parseInt(req.query.in)] },
                  { $size: "$address" },
                ],
              },
            ],
          },
        },
      },
    ])
    .then(() => {
      res.redirect("/home/myaddress");
    });
});

route.post("/addtowish", (req, res) => {
  console.log(req.body);
  // con
  //   .get()
  //   .collection("wishlist")
  //   .updateOne(
  //     { user: ObjectId(req.session.user._id) },
  //     { $push: { products: { product: ObjectId(req.body.pid) } } }
  //   )
  //   .then((result) => {
  //     console.log("inserted to wishlist");
  //     res.send({ added: true });
  //   });
  addToWish.addToWishHelper(req).then(r=>{
          res.send({ added: r.added });

  })
  
});

route.post("/removefromwish", (req, res) => {
  console.log("this is body", req.body);
  // con
  //   .get()
  //   .collection("wishlist")
  //   .updateOne(
  //     { user: ObjectId(req.session.user._id) },
  //     { $pull: { products: { product: ObjectId(req.body.pid) } } }
  //   )
  //   .then((r) => {
  //     // console.log(r);
  //     res.send({ removed: true });
  //   });
  removeFromWish.removeFromWishHelper(req).then(r=>{
    res.send({ removed: r.removed });
  })

  console.log("called remove");
});


route.get("/wishlist", (req, res) => {
  getWishlist.getWishListHelper(req).then(r=>{
    res.render("user/wislist", { r:r.r,user:req.session.user  });
  })
});

route.get("/success", (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
        },
      },
    ],
  };

  paypal.payment.execute(
    paymentId,
    execute_payment_json,
    function (error, payment) {
      //When error occurs when due to non-existent transaction, throw an error else log the transaction details in the console then send a Success string reposponse to the user.
      if (error) {
        console.log(error.response);
        throw error;
      } else {
        // console.log(JSON.stringify(payment));
        res.send("Success");
      }
    }
  );

  res.render("user/paymentsuccess",{user:req.session.user});
});

route.get("/changepassword", (req, res) => {
  msg = req.flash("msg");

  res.render("user/changepassword", { msg,user:req.session.user });
});

route.post("/changepass", (req, res) => {
  if (
    req.body.oldpass == "" ||
    req.body.newpass == "" ||
    req.body.repeatpass == ""
  ) {
    res.send({ status: "empty" });
  } else {
    con
      .get()
      .collection("user")
      .findOne({ _id: ObjectId(req.session.user._id) })
      .then((result) => {
        // console.log(req.body);

        if (result) {
          bcrypt
            .compare(req.body.oldpass, result.password)
            .then((compareresult) => {
              if (compareresult == true) {
                console.log("old and new password match");
                bcrypt.hash(req.body.newpass, 10).then((hashedPass) => {
                  con
                    .get()
                    .collection("user")
                    .updateOne(
                      { _id: ObjectId(req.session.user._id) },
                      { $set: { password: hashedPass } }
                    )
                    .then(() => {
                      console.log("updated successfully");
                      res.send({ status: "updated" });
                    });
                });
              } else {
                res.send({ status: "error" });
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
  cartHelper.changeProQuantity(req).then((result) => {
    res.send(result);
  });
});

route.post("/addressadd/:id", (req, res) => {
  console.log("called");
});

route.post("/orderconfirmcart",async (req, res) => {
  console.log("this is order cod body",req.body);
  var total= cartTotal[0].total - (cartTotal[0].total * req.body.discount) / 100
  var user=await con.get().collection("user").findOne({_id:ObjectId(req.session.user._id)})
 
  var products = [];
  con
    .get()
    .collection("cart")
    .findOne({ user: ObjectId(req.session.user._id) })
    .then((re) => {
      console.log("current walletbalance is,",req.session.user.wallet);
      var walletbalance=req.session.user.wallet;
      products = re.products;
      products.map((s) => {
        s.status = "placed";
      });
     if(req.body.usewallet2=="true"){
      newwalletbalance=walletbalance
     }else{
      newwalletbalance=0
     }
     console.log("d",typeof(req.body.usewallet2));
     console.log("d",walletbalance);
     console.log("d",newwalletbalance);
      con
        .get()
        .collection("orders")
        .insertOne({
          product: products,
          user: req.session.user.name,
          method: "COD",
          status: "placed",
          paymentstatus: "success",
          address: JSON.parse(req.body.address),
          time: moment().format("L"),
          date: moment().toDate(),
          coupon: req.body.ID,
          walletAmount:total- (total-newwalletbalance < 0 ? 0 :  total-newwalletbalance),
          discount: req.body.discount,
          quantity: 1,
          total: total-newwalletbalance < 0 ? 0 :  total-newwalletbalance
            
          
        })
        .then((inserted) => {
          // con.get().collection("cart").aggregate([{$match:{user:ObjectId(req.session.userId)}},{$unwind:$products}])
          products.map(prod=>{
            con.get().collection("Products").updateOne({_id:ObjectId(prod.product)},{$inc:{stock:-prod.count}}).then(()=>{
              console.log("quantity changed");
            })
          })
          insId=inserted.insertedId
          con
            .get()
            .collection("cart")
            .updateOne(
              { user: ObjectId(req.session.user._id) },
              { $set: { products: [] } }
            )
            .then(async() => {
              con.get().collection("coupons").findOne({ID:req.body.ID}).then(async(id)=>{
                if(id){
                  con.get().collection("coupons").updateOne({ID:req.body.ID},{$push:{users:req.session.user._id},$inc:{count:-1}}).then((idr)=>{
                    console.log("here user is pushed to the coupon");

                   
                  })
                }
                order=await con.get().collection("orders").findOne({_id:insId})
                console.log("this is order");
                con.get().collection("user").updateOne({_id:ObjectId(req.session.user._id)},{$inc:{wallet:-(total-order.total)}})
                // con.get().collection("Products").updateOne()
              
                console.log("cart is empty ");
                res.send({ status: "success" });
              })
              
            });
        });
    });
  console.log("this is cart products", cartProducts[0].p[0]);
  var sumCount = 0;

  // })
});

route.post("/cartPayment",async (req, res) => {
  
  var user=await con.get().collection("user").findOne({_id:ObjectId(req.session.user._id)})
 var walletbalanc=user.wallet;
 if(req.body.useWalletonline=="true"){
  walletbalanc=walletbalanc
 }else{
  walletbalanc=0
 }
  address = JSON.parse(req.body.address);
  console.log();
  total= cartTotal[0].total - (cartTotal[0].total * req.body.discount) / 100
  if (req.body.payment == "paypal") {
    console.log("bodyy:", req.body);
    console.log("this is carttotal", cartTotal[0].total);
  
    console.log("you chose paypal");
    var create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: "http://localhost:3000/home/cartSuccess",
        cancel_url: "http://localhost:3000/home/failed",
      },
      transactions: [
        {
          amount: {
            currency: "USD",
            total: Math.ceil(
              total-walletbalanc < 0 ? 0 :  total-walletbalanc
            ),
          },
          description: "This is the payment description.",
        },
      ],
    };
    paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
        throw error;
      } else {
        console.log(payment);
        for (let i = 0; i < payment.links.length; i++) {
          if (payment.links[i].rel === "approval_url") {
            // res.redirect(payment.links[i].href);
            res.send({ paypal: payment.links[i].href });
            // res.send({paypal:"hai"})
          }
        }
        con
          .get()
          .collection("cart")
          .findOne({ user: ObjectId(req.session.user._id) })
          .then((re) => {
            products = re.products;
            console.log(products);

            con
              .get()
              .collection("orders")
              .insertOne({
                product: products,
                user: req.session.user.name,
                method: "paypal",
                status: "pending",
                paymentstatus: "pending",
                walletAmount:total- (total-walletbalanc < 0 ? 0 :  total-walletbalanc),
                address: JSON.parse(req.body.address),
                time: moment().format("L"),
                date: moment().toDate(),
                coupon: req.body.ID,
                discount: req.body.discount,
                total:  total-walletbalanc < 0 ? 0 :  total-walletbalanc
              })
              .then((r) => {
                cartpaypalid = r.insertedId;
                console.log("products inserted after paypal bu pending");
                console.log(r.insertedId);
              });
          });
        // items=[]
      }
    });
  } else if (req.body.payment == "razorpay") {
    console.log("you chose razorpay");
    console.log(req.body);
    console.log(cartProducts);
    items2 = [];
    con
      .get()
      .collection("cart")
      .findOne({ user: ObjectId(req.session.user._id) })
      .then((re) => {
        products = re.products;
        con
          .get()
          .collection("orders")
          .insertOne({
            product: products,
            user: req.session.user.name,
            method: "razorpay",
            status: "pending",
            paymentstatus: "pending",
            walletAmount:total- (total-walletbalanc < 0 ? 0 :  total-walletbalanc),
            address: JSON.parse(req.body.address),
            time: moment().format("L"),
            date: moment().toDate(),
            coupon: req.body.ID,
            discount: req.body.discount,

            // quantity:s.products.count,
            total: Math.ceil(
                          total-walletbalanc < 0 ? 0 :  total-walletbalanc

            ),
          })
          .then((r) => {
            console.log("kjhgfdfghjkl;",r);
            razorid = r.insertedId;
          });
      });

    var options = {
      amount:
        Math.ceil(
          total-walletbalanc < 0 ? 0 :  total-walletbalanc

        ) * 100, // amount in the smallest currency unit
      currency: "INR",
      receipt: "order_rcptid_11",
    };
    instance.orders.create(options, function (err, order) {
      if (err) {
        console.log(err);
      } else {
        console.log(order);
        res.send(order);
      }
    });
  }
});
route.get("/failed", (req, res) => {
  items.map((s) => {
    con
      .get()
      .collection("orders")
      .updateOne(
        { _id: s },
        { $set: { paymentstatus: "failed", status: "pending" } }
      )
      .then((result) => {
        console.log(result);
        res.render("user/paymentfailed");
      });
  });
  // con.get().collection("orders").updateOne({ _id: globalobjid },{ $set: { paymentstatus: "failed", status: "pending" } }).then(()=>{
  //   res.render("user/paymentfailed")
  // })
});

route.post("/varifypayment", (req, res) => {
  let hmac = crypto.createHmac("sha256", "b4PuKMMLTh2w0HRjNrKe36Ax");
  hmac.update(
    req.body["payment[razorpay_order_id]"] +
      "|" +
      req.body["payment[razorpay_payment_id]"]
  );
  hmac = hmac.digest("hex");
  if (hmac == req.body["payment[razorpay_signature]"]) {
    console.log("payment is success");
 console.log("gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg",razorid);
    con
      .get()
      .collection("orders")
      .updateOne(
        { _id: razorid },
        {
          $set: {
            status: "placed",
            paymentstatus: "success",
            "product.$[].status": "placed",
          },
        }
      )
      .then((e) => {
        console.log("lkjhgfdsdfghjklkjhgfd",e);
        
        products.map(prod=>{
          con.get().collection("Products").updateOne({_id:ObjectId(prod.product)},{$inc:{stock:-prod.count}}).then(()=>{
            console.log("quantity changed");
          })
        })
      });

    con
      .get()
      .collection("cart")
      .updateOne(
        { user: ObjectId(req.session.user._id) },
        { $set: { products: [] } }
      )
      .then((r) => {
        console.log("cart is empty");
      });
    res.render("user/success");
  } else {
    console.log("payment is failed");
    items2.map((s) => {
      con
        .get()
        .collection("orders")
        .updateOne(
          { _id: s },
          { $set: { status: "failed payment", paymentstatus: "failed" } }
        )
        .then((d) => {
          console.log(d);
          // console.log("payment is failed");
        });
    });
  }
});
route.get("/cartSuccess", (req, res) => {
  con
    .get()
    .collection("orders")
    .updateOne(
      { _id: ObjectId(cartpaypalid) },
      { $set: { paymentstatus: "success", "product.$[].status": "placed" } }
    )
    .then((result) => {
      products.map(prod=>{
        con.get().collection("Products").updateOne({_id:ObjectId(prod.product)},{$inc:{stock:-prod.count}}).then(()=>{
          console.log("quantity changed");
        })
      })
      console.log("done");
      console.log(result);
    });

  con
    .get()
    .collection("cart")
    .updateOne(
      { user: ObjectId(req.session.user._id) },
      { $set: { products: [] } }
    )
    .then((r) => {
      console.log("after cart empty", r);
      console.log("cart is empty");
    });
  res.render("user/success", { user: req.session.user });
});
route.post("/gettotal", (req, res) => {
  con
    .get()
    .collection("cart")
    .aggregate([
      {
        $match: { user: ObjectId(req.session.user._id) },
      },
      {
        $unwind: "$products",
      },

      {
        $lookup: {
          from: "Products",
          localField: "products.product",
          foreignField: "_id",
          as: "pro",
        },
      },
      {
        $project: {
          "products.product": 1,
          "products.count": 1,
          pro: { $arrayElemAt: ["$pro", 0] },
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: { $multiply: ["$products.count", "$pro.offerprice"] },
          },
        },
      },
    ])
    .toArray()
    .then((total) => {
      con
        .get()
        .collection("cart")
        .aggregate([
          {
            $match: { user: ObjectId(req.session.user._id) },
          },
          {
            $unwind: "$products",
          },

          {
            $lookup: {
              from: "Products",
              localField: "products.product",
              foreignField: "_id",
              as: "pro",
            },
          },
          {
            $project: {
              "products.product": 1,
              "products.count": 1,
              pro: { $arrayElemAt: ["$pro", 0] },
            },
          },
          {
            $project: {
              total: {
                $sum: { $multiply: ["$products.count", "$pro.offerprice"] },
              },
            },
          },
        ])
        .toArray()
        .then((eachsum) => {
          cartTotal = total;
          res.send(total);
          console.log(eachsum);
        });
    });
});

route.get("/removeFromCart/:id", (req, res) => {
  con
    .get()
    .collection("cart")
    .updateOne(
      { user: ObjectId(req.session.user._id) },
      { $pull: { products: { product: ObjectId(req.params.id) } } }
    )
    .then((r) => {
      console.log(r);
      res.redirect("/home/cart");
    });
  console.log(req.params);
});

route.get("/editaddress", (req, res) => {
  con
    .get()
    .collection("user")
    .findOne({ _id: ObjectId(req.session.user._id) })
    .then((add) => {
      // console.log(user.address[req.query.i]);
      address = add.address[req.query.i];
      res.render("user/editAddress", { user: req.session.user, address });
    });
});

route.post("/couponcheck", (req, res) => {
  console.log(req.body);
  codefromcart = req.body.ID;
  couponHelper.checkCode(req).then((result) => {
    if(result.couponFound==true){
      console.log(result);
       coupondis = result.result;
    res.send(result);
    }
    else if(result.couponFound==false){
      console.log(result);
      res.send(result);
    }
   
  });
});

route.post("/removeCoupon", (req, res) => {
  couponHelper.removeCoupon(req);
});
route.get("/orderinfo/:id", (req, res) => {
  console.log(req.body);
  con
    .get()
    .collection("orders")
    .aggregate([
      { $match: { _id: ObjectId(req.params.id) } },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "Products",
          localField: "product.product",
          foreignField: "_id",
          as: "pp",
        },
      },
    ])
    .toArray()
    .then((order) => {
      console.log("this is order", order);
      res.render("user/orderinfo", {
        user: req.session.user,
        order,
        discount: req.query.dis,
      });
    });
});

route.get("/getwallet",  (req, res) => {
  getWallet.getWallet(req).then(user=>{
    if(user){
      res.render("user/mywallet", { user:user.user,wallet:user.wallet });

    }
  })
 });

route.get("/myaddress", (req, res) => {
  con.get().collection("user").findOne({_id:ObjectId(req.session.user._id)}).then(user=>{
    res.render("user/myaddress", { user });

  })
});

//delete from order
route.post("/deletefrombulkorder", (req, res) => {
  if (req.body.discount == "") {
    disc = 0;
  } else {
    disc = req.body.discount;
  }
  console.log("this is body from cancel order", req.body);
  con
    .get()
    .collection("orders")
    .updateOne(
      {
        _id: ObjectId(req.body.id),
        "product.product": ObjectId(req.body.model),
      },
      { $set: { "product.$.status": "cancelled" } }
    )
    .then((e) => {
      if (e.modifiedCount != 0) {
        res.send({ cancelled: true });
        con
          .get()
          .collection("Products")
          .findOne({ _id: ObjectId(req.body.model) })
          .then((pro) => {
            if (pro) {
              walletAmount =
                Number(req.body.count) * parseInt(pro.offerprice) -
                (parseInt(pro.offerprice) * parseInt(disc)) / 100;
              console.log("this is wallet amount", walletAmount);
              if(req.body.method!="COD"){
                con
                .get()
                .collection("user")
                .updateOne(
                  { _id: ObjectId(req.session.user._id) },
                  { $inc: { wallet:Number(req.body.amounttoreturn) } }
                )
                con.get().collection("wallet").insertOne({user:ObjectId(req.session.user._id),type:"credit",amount:Number(req.body.amounttoreturn),product:`cancellation of ${req.body.name}`,date:new Date().toLocaleString()})

              }
                  
                  con.get().collection("Products").updateOne({_id:ObjectId(req.body.model)},{$inc:{stock:parseInt(req.body.count)}}).then(()=>{
                  })
                  
               
            }
          });
      } else {
        res.send({ cancelled: false });
      }
    });
});

route.post("/returnproduct", (req, res) => {
  console.log(req.body);

  con.get().collection("return").insertOne({order:ObjectId(req.body.id),model:ObjectId(req.body.model)}).then(r=>{
    console.log(r);
    con.get().collection("orders").updateOne({user:req.session.user.name,"product.product":ObjectId(req.body.model)},{$push:{product:{status:"return"}}})
    res.send({return:true})
  })
});

route.post("/payfromwallet",async(req,res)=>{

  console.log("this is order cod body",req.body);
  var total= cartTotal[0].total - (cartTotal[0].total * req.body.discount) / 100
  var user=await con.get().collection("user").findOne({_id:ObjectId(req.session.user._id)})
 
  var products = [];
  con
    .get()
    .collection("cart")
    .findOne({ user: ObjectId(req.session.user._id) })
    .then((re) => {
      console.log("current walletbalance is,",req.session.user.wallet);
      var walletbalance=req.session.user.wallet;
      products = re.products;
      products.map((s) => {
        s.status = "placed";
      });
     if(req.body.usewallet3=="true"){
      newwalletbalance=walletbalance
     }else{
      newwalletbalance=0
     }
     console.log("d",typeof(req.body.usewallet2));
     console.log("d",walletbalance);
     console.log("d",newwalletbalance);
      con
        .get()
        .collection("orders")
        .insertOne({
          product: products,
          user: req.session.user.name,
          method: "wallet",
          status: "placed",
          paymentstatus: "success",
          address: JSON.parse(req.body.address),
          time: moment().format("L"),
          date: moment().toDate(),
          coupon: req.body.ID,
          walletAmount:total- (total-newwalletbalance < 0 ? 0 :  total-newwalletbalance),
          discount: req.body.discount,
          quantity: 1,
          total: total
            
          
        })
        .then((inserted) => {

          insId=inserted.insertedId
          con
            .get()
            .collection("cart")
            .updateOne(
              { user: ObjectId(req.session.user._id) },
              { $set: { products: [] } }
            )
            .then(async() => {
              con.get().collection("coupons").findOne({ID:req.body.ID}).then(async(id)=>{
                if(id){
                  con.get().collection("coupons").updateOne({ID:req.body.ID},{$push:{users:req.session.user._id},$inc:{count:-1}}).then((idr)=>{
                    console.log("here user is pushed to the coupon");

                   
                  })
                }
                order=await con.get().collection("orders").findOne({_id:insId})
                console.log("this is order");
                console.log(total-order.total);
                con.get().collection("user").updateOne({_id:ObjectId(req.session.user._id)},{$inc:{wallet:-total}}).then(()=>{
                  con.get().collection("wallet").insertOne({user:ObjectId(req.session.user._id),amount:total,type:"debit",date:new Date().toLocaleString()})
                })
                // con.get().collection("Products").updateOne()
                
                console.log("cart is empty ");
                res.send({ status: "success" });
              })
              
            });
        });
    });
    
  console.log("this is cart products", cartProducts[0].p[0]);
  var sumCount = 0;


})

module.exports = route;
