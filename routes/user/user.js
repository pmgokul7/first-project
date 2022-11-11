const { Router } = require("express");
const Razorpay = require("razorpay");
const crypto=require("crypto")
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
const moment=require("moment")
const carthelper = require("../../helpers/cartHelper");
const cartHelper = require("../../helpers/cartHelper");


const couponHelper=require("../../helpers/couponHelpers")
const profileHelper=require("../../helpers/profileHelpers")
const { json } = require("body-parser");
const { log } = require("console");
instance = new Razorpay({
  key_id: "rzp_test_kwZGFuI0hWeY2V",
  key_secret: "b4PuKMMLTh2w0HRjNrKe36Ax",
});


route.use(function (req, res, next) {
  if (req.session.user&&req.session.admin==false) {
    next();
  } else {
    res.redirect("/login");
    
  }
}); 


route.get("/cart", (req, res) => {
  carthelper.getCartProducts(req).then((result) => {
   if( typeof(coupondis)=="undefined"){
    coupondis=0
   }else{
    coupondis=coupondis.discount
   }
    res.render("user/cart", { result ,user:req.session.user});
  });
});
route.get("/", (req, res) => {
  res.render("user/userHome", { user: req.session.user });
});

route.get("/products", (req, res) => {
  // con.get().collection("wishlist").aggregate([{$match:{}},{$lookup:}])
  res.render("user/products",{user:req.session.user});
});

route.get("/products/info", (req, res) => {
  helper.info(req).then((result) => {
    res.render("user/info", {
      result: result.result,
      cart: result.ifres,
      user: req.session.user,
      wishlistp:result.wishlistp
    });
  });
});

route.post("/products", (req, res) => {
  con
    .get()
    .collection("Products")
    .find({ model: { $regex: req.body.search, $options: "i" } })
    .toArray()
    .then((result) => {
      con
        .get()
        .collection("wishlist")
        .find({ user: ObjectId(req.session.user._id) })
        .toArray()
        .then((wish) => {
          searcsh = req.body.search;
          console.log("this is wishlist",wish);
          res.render("user/products", {
            result,
            searcsh,
            wish,
            user: req.session.user,
          });
        });
    });
});

// route.get("/cart", (req, res) => {
//   //    console.log(req.session.user);
//   // showCart.showCart(req).then((result) => {
//   //   if (result.resultfound) {
//   //     res.render("user/cart", { result: result.ress });
//   //     console.log(result);
//   //   }
//   // });
// });

route.get("/cart/remove", (req, res) => {
  removeFromCart2.removeFromCart2(req).then(() => {
    res.redirect("/home/cart");
  });
});

route.get("/orders", (req, res) => {
  helper.myOrders(req).then((result) => {
    res.render("user/orders", { result ,user:req.session.user});
  });
});

route.get("/checkout/:id", (req, res) => {
  helper.checkout(req).then((result) => {
    res.render("user/buynow", { result: result.result, user: result.user ,price:req.query.price});
  });
});


// route.get("/checkout/:id", (req, res) => {
//   helper.checkout(req).then((result) => {
//     res.json( { result: result.result, user: result.user ,price:req.query.price});
//   });
// });
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
          total: { $sum: { $multiply: ["$products.count", "$pro.offerprice"] } },
        },
      },
    ])
    .toArray()
    .then((cartItems) => {
      con
        .get()
        .collection("cart")
        .aggregate([
          { $match: { $and: [{ user: ObjectId(req.session.user._id) }] } },
          { $unwind: "$products" },
          {
            $lookup: {
              from: "Products",
              localField: "products.product",
              foreignField: "_id",
              as: "p",
            },
          },
        ])
        .toArray()
       
        .then((result) => {
          console.log("cartitems:",cartItems);
          globalcartTotal=cartItems
          cartProducts = result;
         
          res.render("user/buynow2", {
            result,
            user: req.session.user,
            cartItems,
            
          });
          console.log(req.session.user);
        });
    });

  // })
});

route.get("/profile", (req, res) => {
  profileHelper.getProfile(req).then(result=>{
    console.log(result);
    res.render("user/profile",{result,user:req.session.user})
  })
  
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
      res.redirect("/home/profile");
    });
});

route.post("/addtowish", (req, res) => {
console.log(req.body);
  con
    .get()
    .collection("wishlist")
    .updateOne({user: ObjectId(req.session.user._id)},{$push:{"products":{"product":ObjectId(req.body.pid)}}})
    .then((result) => {
      console.log("inserted to wishlist");
      res.send({added:true})
    });
  
});

route.post("/removefromwish", (req, res) => {
  console.log("this is body",req.body);
  con
    .get()
    .collection("wishlist")
    .updateOne(
      { user: ObjectId(req.session.user._id) },
      { $pull: {"products":{"product": ObjectId(req.body.pid)} } }
    )
    .then((r) => {
      // console.log(r);
      res.send({ removed:true });
    });
  console.log("called remove");
});

// })

route.get("/wishlist", (req, res) => {
  con
    .get()
    .collection("wishlist")
    .aggregate([
      { $match: { user: ObjectId(req.session.user._id) } },
      {
        $lookup: {
          from: "Products",
          localField: "products.product",
          foreignField: "_id",
          as: "p",
        },
      },
    ])
    .toArray()
    .then((r) => {
      console.log("this is wishlist",r);
      res.render("user/wislist", { r ,user:req.session.user});
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

  res.render("user/paymentsuccess");
});

route.get("/changepassword", (req, res) => {
  msg = req.flash("msg");

  res.render("user/changepassword", { msg });
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

route.post("/orderconfirmcart", (req, res) => {
  // console.log(req);
  var products=[]
  con.get().collection("cart").findOne({user:ObjectId(req.session.user._id)}).then(re=>{
    products=(re.products)
    products.map(s=>{
     s.status="placed"
    })
    products[0].status="placed"
    con.get().collection("orders").insertOne({

      product:products,
          user: req.session.user.name,
          method: "COD",
          status: "placed",
          paymentstatus : "success",
          address:JSON.parse(req.body.address),
          time:moment().format("L"),
          date:moment().toDate(),
          coupon:req.body.code,
          discount:req.body.discount,
          quantity:1,
          total:Math.ceil(cartTotal[0].total-cartTotal[0].total*req.body.discount/100) 
    }).then(()=>{
         con.get().collection("cart").updateOne({user:ObjectId(req.session.user._id)},{$set:{products:[]}}).then(()=>{
          console.log("cart is empty ");
          res.send({status:"success"})
         })
      
    })
    
  })
  console.log("this is cart products",cartProducts[0].p[0]);
  var sumCount=0
  
  
   
  // })
     

  
});

route.post("/cartPayment",(req,res)=>{
  address=JSON.parse(req.body.address)
console.log();
  
  if(req.body.payment=="paypal"){
    console.log("bodyy:",req.body);
    console.log("this is carttotal",cartTotal[0].total);
    cartProducts.map((s)=>{
     
    })
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
            total:Math.ceil(cartTotal[0].total-cartTotal[0].total*req.body.discount/100),
            
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
            res.send({paypal:payment.links[i].href})
            // res.send({paypal:"hai"})
          }
        }
        con.get().collection("cart").findOne({user:ObjectId(req.session.user._id)}).then(re=>{
          products=(re.products)
          product[0].status="pending"
          console.log(products);
        
          con.get().collection("orders").insertOne({
            product:products,
            user: req.session.user.name,
            method: "paypal",
            status: "pending",
            paymentstatus:"pending",
            address:JSON.parse(req.body.address),
            time:moment().format("L"),
          date:moment().toDate(),
            coupon:req.body.ID,
            discount:req.body.discount,
           total:Math.ceil(cartTotal[0].total-cartTotal[0].total*req.body.discount/100),
      
          }).then((r)=>{
            cartpaypalid=r.insertedId
            console.log("products inserted after paypal bu pending");
            // items.push(r.insertedId)
            console.log(r.insertedId);
          })
        })
        // items=[]
       
        
      
      }
    });
  }
  else  if(req.body.payment=="razorpay"){
    console.log("you chose razorpay");
    console.log(req.body);
    console.log(cartProducts);
    items2=[]
    con.get().collection("cart").findOne({user:ObjectId(req.session.user._id)}).then(re=>{

      products=re.products
      con.get().collection("orders").insertOne({
        product:products,
        user: req.session.user.name,
        method: "razorpay",
        status: "pending",
        paymentstatus:"pending",
        address:JSON.parse(req.body.address),
        time:moment().format("L"),
            date:moment().toDate(),  
        // quantity:s.products.count,
        total:Math.ceil(cartTotal[0].total-cartTotal[0].total*req.body.discount/100),
  
      }).then(r=>{
            razorid=r.insertedId
      })
    })
    
 
    var options = {
      amount:Math.ceil(cartTotal[0].total-cartTotal[0].total*req.body.discount/100)*100,  // amount in the smallest currency unit
      currency: "INR",
      receipt: "order_rcptid_11"
    };
    instance.orders.create(options, function(err, order) {
      if(err){
        console.log(err);
      }
      else{
        console.log(order);
        res.send(order)
       

      }
      
    });
    
  }
})
route.get("/failed",(req,res)=>{
  items.map((s)=>{
    con.get().collection("orders").updateOne({_id:s},{$set:{paymentstatus:"failed",status:"pending"}}).then((result)=>{
          console.log(result);
          res.render("user/paymentfailed")

    })

  })
  // con.get().collection("orders").updateOne({ _id: globalobjid },{ $set: { paymentstatus: "failed", status: "pending" } }).then(()=>{
  //   res.render("user/paymentfailed")
  // })
})


route.post("/varifypayment",(req,res)=>{
  let hmac=crypto.createHmac('sha256','b4PuKMMLTh2w0HRjNrKe36Ax')
  hmac.update(req.body['payment[razorpay_order_id]']+'|'+req.body['payment[razorpay_payment_id]']);
  hmac=hmac.digest('hex')
  if(hmac==req.body['payment[razorpay_signature]']){
    console.log("payment is success");
    
      con.get().collection("orders").updateOne({_id:ObjectId(razorid)},{$set:{status:"placed",paymentstatus:"success"}}).then(e=>{
        console.log("this is after razorpay success");
      })
  
    con.get().collection("cart").updateOne({user:ObjectId(req.session.user._id)},{$set:{products:[]}}).then((r)=>{
          console.log("cart is empty")
          })
    res.render("user/success")


  }else{
    console.log("payment is failed");
    items2.map(s=>{
      con.get().collection("orders").updateOne({_id:s},{$set:{status:"failed payment",paymentstatus:"failed"}}).then((d)=>{
        console.log(d);
        // console.log("payment is failed");
      })
    })
  }
})
route.get("/cartSuccess",(req,res)=>{
  
 
    con.get().collection("orders").updateOne({_id:ObjectId(cartpaypalid)},{$set:{paymentstatus:"success","product.status":"placed"}}).then((result)=>{
          console.log(result);
          

    })

  
  con.get().collection("cart").updateOne({user:ObjectId(req.session.user._id)},{$set:{products:[]}}).then((r)=>{
  console.log("after cart empty",r);
  console.log("cart is empty")
  })
  res.render("user/success",{user:req.session.user})

})
route.post("/gettotal",(req,res)=>{
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
        total: { $sum: { $multiply: ["$products.count", "$pro.offerprice"] } },
      },
    },
  ])
  .toArray().then(total=>{
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
         
          total: { $sum: { $multiply: ["$products.count", "$pro.offerprice"] } },
        },
      },
    ])
    .toArray().then((eachsum)=>{
      cartTotal=total
      res.send(total)
      console.log(eachsum);
    })

  })
})

route.get("/removeFromCart/:id",(req,res)=>{
  con.get().collection("cart").updateOne({user:ObjectId(req.session.user._id)},{$pull:{"products":{product:ObjectId(req.params.id)}}}).then(r=>{
    console.log(r);
    res.redirect("/home/cart")
  })
  console.log(req.params);
})

route.get("/editaddress",(req,res)=>{
  con.get().collection("user").findOne({_id:ObjectId(req.session.user._id)}).then((add)=>{
    // console.log(user.address[req.query.i]);
    address=add.address[req.query.i]
    res.render("user/editAddress",{user:req.session.user,address})

  })
})


route.post("/couponcheck",(req,res)=>{
  console.log(req.body);
  codefromcart=req.body.ID
  couponHelper.checkCode(req).then(result=>{
    coupondis=result.result
    console.log(result);
    res.send(result)
  })
})

route.post("/removeCoupon",(req,res)=>{
   couponHelper.removeCoupon(req)
})
route.get("/orderinfo/:id",(req,res)=>{
  console.log(req.body);
  con.get().collection("orders").aggregate([{$match:{_id:ObjectId(req.params.id)}},{$unwind:"$product"},{$lookup:{
    from:"Products",
    localField:"product.product",
    foreignField:"_id",
    as:"pp"
  }}]).toArray().then((order)=>{
    console.log("this is order",order);
    res.render("user/orderinfo",{user:req.session.user,order,discount:req.query.dis})
  })
 
})

route.get("/getwallet",async(req,res)=>{
  let user=con.get().collection("user").findOne({_id:ObjectId(req.session.user._id)})
  if(user){
    res.render("user/mywallet",{user:req.session.user})
  }
  
})

route.get("/myaddress",(req,res)=>{
  res.render("user/myaddress",{user:req.session.user})
})
module.exports = route;
