const { Router } = require("express");
const express = require("express");
const { ObjectId, ObjectID, Db } = require("mongodb");
const route = express.Router();
const con = require("../../config/connection");
const helper = require("../../helpers/buyProducts");
const addToCart = require("../../helpers/addTocart");
const removeFromCart = require("../../helpers/removeFromCart");
const removeFromCart2 = require("../../helpers/removeFromCart2");
const showCart = require("../../helpers/showCart");

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
      searcsh = req.body.search;
      res.render("user/products", { result, searcsh, user: req.session.user });
    });
});

route.get("/cart", (req, res) => {
  //    console.log(req.session.user);
  showCart.showCart(req).then((result) => {
    if (result.resultfound) {
      res.render("user/cart", { result: result.ress });
    }
  });
});

route.post("/cart/remove", (req, res) => {
  removeFromCart2.removeFromCart2(req);
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
  // con.get().collection("user").findOne({_id:new ObjectId(req.session.user._id)}).then((user)=>{
  con
    .get()
    .collection("cart")
    .aggregate([
      { $match: { $and: [{ user: new ObjectId(req.session.user._id) }] } },
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

route.post("/cart/quantityupdate", (req, res) => {
  // console.log(req.body);
  con
    .get()
    .collection("user")
    .findOne({ _id: new ObjectId(req.session.user._id) })
    .then((user) => {
      con
        .get()
        .collection("cart")
        .aggregate([
          { $match: { $and: [{ user: req.session.user._id }] } },
          {
            $lookup: {
              from: "Products",
              localField: "products",
              foreignField: "_id",
              as: "p",
            },
          },
        ])
        .toArray()
        .then((result) => {
          res.send({ result });
        });
    });
});

route.post("/cart/updatecount",async (req, res) => {
  let proExist = await con.get().collection("cart").findOne({user:new ObjectId(req.session.user._id),"products.product": new ObjectId(req.body.id)})
      

  
  if(proExist){
    con.get().collection('cart').updateOne({user:new ObjectId(req.session.user._id),"products.product":new ObjectId(req.body.id)},{$inc:{"products.$.count":1}} ).then((e)=>{
      console.log("thisssssssssssssssss:",e);

      res.send({status:1})
      
    })
  }

})
route.post("/cart/updatecountminus",async (req, res) => {
  let proExist = await con.get().collection("cart").findOne({user:new ObjectId(req.session.user._id),"products.product": new ObjectId(req.body.id)})
      
  // console.log(proExist.user);
  
  if(proExist){
   
    con.get().collection('cart').updateOne({user:new ObjectId(req.session.user._id),"products.product":new ObjectId(req.body.id)},{$inc:{"products.$.count":-1}} ).then((e)=>{
      
res.send({status:"decremented"})
      

    })
  }

})



route.get("/profile",(req,res)=>{
  con.get().collection("user").findOne({_id:new ObjectId(req.session.user._id)}).then((result)=>{
    // console.log(result);
    res.render("user/profile",{result})

  })
})

 route.get("/deleteaddress",(req,res)=>{
con.get().collection("user").updateOne({_id:new ObjectId(req.session.user._id)}, [
    {$set: {address: {
          $concatArrays: [ 
                 {$slice: ["$address",parseInt(req.query.in)]}, 
                 {$slice: ["$address", {$add: [1,parseInt(req.query.in)]}, {$size: "$address"}]}
          ]
    }}}
]).then(()=>{
  res.redirect("/home/profile")
})
 })



module.exports = route;
