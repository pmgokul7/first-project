const { Router } = require("express");
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

const carthelper = require("../../helpers/cartHelper");
const cartHelper = require("../../helpers/cartHelper");
const { json } = require("body-parser");

route.get("/cart", (req, res) => {
  carthelper.getCartProducts(req).then((result) => {
    res.render("user/cart", { result });
  });
});

route.use(function (req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login");
    next();
  }
});
route.get("/", (req, res) => {
  res.render("user/userHome", { result: req.session.user });
});

route.get("/products", (req, res) => {
  // con.get().collection("wishlist").aggregate([{$match:{}},{$lookup:}])
  res.render("user/products");
});

route.get("/products/info", (req, res) => {
  helper.info(req).then((result) => {
    res.render("user/info", {
      result: result.result,
      cart: result.ifres,
      user: req.session.user,
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
        .collection("user")
        .findOne({ _id: ObjectId(req.session.user._id) })
        .then((wish) => {
          searcsh = req.body.search;
          console.log(wish);
          res.render("user/products", {
            result,
            searcsh,
            wish,
            user: req.session.user,
          });
        });
    });
});

route.get("/cart", (req, res) => {
  //    console.log(req.session.user);
  // showCart.showCart(req).then((result) => {
  //   if (result.resultfound) {
  //     res.render("user/cart", { result: result.ress });
  //     console.log(result);
  //   }
  // });
});

route.get("/cart/remove", (req, res) => {
  removeFromCart2.removeFromCart2(req).then(() => {
    res.redirect("/home/cart");
  });
});

route.get("/orders", (req, res) => {
  helper.myOrders(req).then((result) => {
    res.render("user/orders", { result });
  });
});

route.get("/checkout/:id", (req, res) => {
  helper.checkout(req).then((result) => {
    res.render("user/buynow", { result: result.result, user: result.user });
  });
});

route.post("/addaddress/:id", (req, res) => {
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
          total: { $sum: { $multiply: ["$products.count", "$pro.price"] } },
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
          cartProducts = result;
          res.render("user/buynow2", {
            result,
            user: req.session.user,
            cartItems,
          });
        });
    });

  // })
});

route.get("/profile", (req, res) => {
  con
    .get()
    .collection("user")
    .findOne({ _id: ObjectId(req.session.user._id) })
    .then((result) => {
      // console.log(result);
      res.render("user/profile", { result });
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
      res.redirect("/home/profile");
    });
});

route.post("/addtowish", (req, res) => {
  // con
  //   .get()
  //   .collection("user")
  //   .updateOne(
  //     { _id: ObjectId(req.session.user._id) },
  //     { $push: { wishlist: ObjectId(req.body.pid) } }
  //   )
  //   .then((r) => {
  //     console.log(r);
  //     res.send({ added: true });
  //   });
  // }
  con
    .get()
    .collection("wishlist")
    .findOne({ user: ObjectId(req.session.user._id) })
    .then((result) => {
      if (result) {
      }
    });
  console.log("add called");
});

route.post("/removefromwish", (req, res) => {
  con
    .get()
    .collection("user")
    .updateOne(
      { _id: ObjectId(req.session.user._id) },
      { $pull: { wishlist: ObjectId(req.body.pid) } }
    )
    .then((r) => {
      // console.log(r);
      res.send({ added: true });
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
          localField: "product",
          foreignField: "_id",
          as: "p",
        },
      },
    ])
    .toArray()
    .then((r) => {
      res.render("user/wislist", { r });
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
  // console.log(cartProducts);
  cartProducts.map(s=>{
    con.get().collection("orders").insertOne({

      product:ObjectId(s.p[0]._id),
          user: req.session.user.name,
          method: "COD",
          status: "placed",
          address:JSON.parse(req.body.address),
          time: req.body.date,
          quantity:s.products.count,
          total: parseInt(s.p[0].price) * parseInt(s.products.count),
    }).then(()=>{
         
      
    })
  })
      res.send({status:"success"})

  
});

route.post("/cartPayment",(req,res)=>{
  address=JSON.parse(req.body.address)

  
  if(req.body.payment=="paypal"){
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
        cancel_url: "http://cancel.url",
      },
      transactions: [
        {
         
          amount: {
            currency: "USD",
            total: req.body.total,
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
        cartProducts.map(s=>{
          con.get().collection("orders").insertOne({
            product:ObjectId(s.p[0]._id),
            user: req.session.user.name,
            method: "paypal",
            status: "pending",
            paymentstatus:"pending",
            address:JSON.parse(req.body.address),
            time: new Date().toLocaleString('en-US'),
            quantity:s.products.count,
            total: parseInt(s.p[0].price) * parseInt(s.products.count),
      
          }).then((r)=>{
            items=[]
            console.log("products inserted after paypal bu pending");
            items.push(r.insertedId)
            console.log(r.insertedId);
          })
        })
      
      }
    });
  }
})

route.get("/cartSuccess",(req,res)=>{
  console.log("success");
  
})

module.exports = route;
