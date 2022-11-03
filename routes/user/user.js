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
const bcrypt=require("bcrypt")
const paypal=require("paypal-rest-sdk")




const carthelper=require("../../helpers/cartHelper")


route.get("/cart",(req,res)=>{
  carthelper.getCartProducts(req).then((result)=>{
    res.render("user/cart",{result})
  })
})





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
  removeFromCart2.removeFromCart2(req).then(()=>{
    res.redirect("/home/cart")
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
  // con.get().collection("user").findOne({_id: ObjectId(req.session.user._id)}).then((user)=>{
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
      res.render("user/buynow2", { result, user: req.session.user });
      // console.log(result[0].p);
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
  // con.get().collection("wishlist").findOne({product: ObjectId(req.body.pid)}).then((ris)=>{
  //   if(ris){
  //     res.send({alreadyfound:true})
  //     console.log("found already");
  //   }
  //   else{
  con
    .get()
    .collection("user")
    .updateOne(
      { _id: ObjectId(req.session.user._id) },
      { $push: { wishlist: ObjectId(req.body.pid) } }
    )
    .then((r) => {
      console.log(r);
      res.send({ added: true });
    });
  // }
  console.log("add called");
});



route.post("/removefromwish",(req,res)=>{
  con
  .get()
  .collection("user")
  .updateOne(
    { _id: ObjectId(req.session.user._id) },
    { $pull: { wishlist: ObjectId(req.body.pid) } }
  )
  .then((r) => {
    console.log(r);
    res.send({ added: true });
  });
  console.log("called remove");
})

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
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "USD",
        }
    }]
  }; 
  
  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    //When error occurs when due to non-existent transaction, throw an error else log the transaction details in the console then send a Success string reposponse to the user.
  if (error) {
      console.log(error.response);
      throw error;
  } else {
      console.log(JSON.stringify(payment));
      res.send('Success');
  }
});

  res.render("user/paymentsuccess");
});




route.post("/plus",(req,res)=>{
  console.log("plus called");
  con.get().collection("cart").findOne({user:ObjectId(req.session.user._id)}).then((result)=>{
    if(result){
      con.get().collection("cart").updateOne({user:ObjectId(req.session.user._id),"products.product":ObjectId(req.body.pid)},{$inc:{'products.$.count':1}}).then((err,resu)=>{
        if(err){
                  console.log(err);

        }
        else{
          console.log(resu);
        }
      })
    }
  })
})


route.get("/changepassword",(req,res)=>{
  msg = req.flash("msg");

  res.render("user/changepassword",{msg})
})

route.post("/changepass",(req,res)=>{
  if(req.body.oldpass==""||req.body.newpass==""||req.body.repeatpass==""){
    res.send({status:"empty"})
  }else{
  con.get().collection("user").findOne({_id:ObjectId(req.session.user._id)}).then((result)=>{
console.log(req.body);

    if(result){
      bcrypt.compare(req.body.oldpass,result.password).then((compareresult)=>{
       if(compareresult==true){
        console.log("old and new password match");
        bcrypt.hash(req.body.newpass,10).then((hashedPass)=>{
           con.get().collection("user").updateOne({_id:ObjectId(req.session.user._id)},{$set:{password:hashedPass}}).then(()=>{
            console.log("updated successfully");
            res.send({status:"updated"})
           });
        })
      }
      else{
        res.send({status:"error"})
        console.log("old and new password wont match");
      }
      })
   
     
    }else{
      res.redirect("/login")
    }
  
  })

  }

})


module.exports = route;
