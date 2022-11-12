const { application, Router } = require("express");
const express = require("express");
const { ObjectId } = require("mongodb");
const route = express.Router();
const con = require("../../config/connection");
const helper = require("../../helpers/adminHelpers");
const moment=require("moment");
const adminHelpers = require("../../helpers/adminHelpers");
const couponHelpers = require("../../helpers/couponHelpers");

route.use(function (req, res, next) {
  if (req.session.adminlogged==true) {
    next();
  } else {
    res.redirect("/adminlogin")
    // next();
  }
});

route.get("/", (req, res) => {
  // con.get().collection("orders").aggregate([{$match:{}},{$group:{_id:"$method",count:{$sum:1}}},]).toArray().then((orders)=>{
  //   res.render("admin/adminDash",{orders});
  //   console.log(orders);
  // })
  con.get().collection("orders").find({method:"paypal"}).toArray().then(paypal=>{
    console.log(paypal.length);
    con.get().collection("orders").find({method:"COD"}).toArray().then(cod=>{
      console.log(cod.length);
      con.get().collection("orders").find({method:"razorpay"}).toArray().then(razor=>{
        // console.log(razor.length);
        con.get().collection("orders").aggregate([{$match:{status:"placed",method:"COD"}},{$group:{
          _id:null,
          sumcod:{$sum:"$total"}
        }}]).toArray().then((codd)=>{
          // console.log(codd);
          con.get().collection("orders").aggregate([{$match:{status:"placed",method:"paypal"}},{$group:{
            _id:null,
            sumpaypal:{$sum:"$total"}
          }}]).toArray().then((paypall)=>{
            // console.log("this is placed paypal",paypall);
            con.get().collection("orders").aggregate([{$match:{status:"placed",method:"razorpay"}},{$group:{
              _id:null,
              sumrazor:{$sum:"$total"}
            }}]).toArray().then((razorr)=>{
             console.log("razorr:",razorr);
             
              res.render("admin/adminDash",{paypal:paypal.length,cod:cod.length,razorpay:razor.length,codR:codd[0].sumcod,paypalR:paypall[0].sumpaypal,razorR:razorr[0].sumrazor,total:5+paypall[0].sumpaypal+codd[0].sumcod});
              // console.log("codd",codd[0]);
              // console.log(paypall[0]);

              console.log(razorr,paypall,codd);

            })

            
          })

        })
        
      })
    })
  })
  
});

route.get("/products", (req, res) => {
  con
    .get()
    .collection("Products")
    .find({})
    .toArray()
    .then((result) => {
      res.render("admin/productslist", { result });
    });
});

route.get("/products/delete", (req, res) => {
  helper.productDelete(req.query).then((result) => {
    if (result.productDeleted == true) {
      res.redirect("/admin/products");
    }
  });
});

route.get("/products/add", (req, res) => {
  con
    .get()
    .collection("categories")
    .findOne({})
    .then((result) => {
      con
        .get()
        .collection("cat")
        .find({})
        .toArray()
        .then((resul) => {
          res.render("admin/addProduct", { result, resul });
          console.log(resul);
        });
    });
});

route.get("/users", (req, res) => {
  const page = req.query.p || 0;
  const dataperpage = 10;
  con
    .get()
    .collection("user")
    .aggregate([
      { $match: {} },
      { $skip: page * dataperpage },
      { $limit: dataperpage },
    ])
    .toArray()
    .then((result) => {
      con
        .get()
        .collection("user")
        .countDocuments((count) => {
          res.render("admin/userlist", { result, count });
        });
    });
});

route.get("/users/edit", (req, res) => {
  con
    .get()
    .collection("user")
    .findOne({ _id:  ObjectId(req.query.id) })
    .then((result) => {
      res.render("admin/edituser", { result });
    });
});

route.get("/users/delete", (req, res) => {
  con
    .get()
    .collection("user")
    .deleteOne({ _id:  ObjectId(req.query.id) })
    .then(() => {
      res.redirect("/admin/users");
    });
});

route.get("/products/edit", (req, res) => {
  con
    .get()
    .collection("Products")
    .findOne({ _id:  ObjectId(req.query.id) })
    .then((result) => {
      con
        .get()
        .collection("cat")
        .find({})
        .toArray()
        .then((resul) => {
          con
            .get()
            .collection("categories")
            .find()
            .toArray()
            .then((cat) => {
              res.render("admin/updateproduct", { result, cat, resul });
            });
        });
    });
});

route.post("/users/edit", (req, res) => {
  con
    .get()
    .collection("user")
    .updateOne(
      { _id:  ObjectId(req.query.id) },
      {
        $set: {
          name: req.body.name,
          mobile: req.body.mobile,
          email: req.body.email,
          status: req.body.status,
        },
      }
    )
    .then(() => {
      res.redirect("/admin/users");
    });
});

route.get("/orders", (req, res) => {
  const page = req.query.p || 0;
  const dataperpage = 10;
  con
    .get()
    .collection("orders")
    .countDocuments()
    .then((count) => {
      con
        .get()
        .collection("orders")
        .aggregate([
          { $match: {} },
          {$unwind:"$product"},
          {
            $lookup: {
              from: "Products",
              localField: "product.product",
              foreignField: "_id",
              as: "p",
            },
          },
          { $skip: page * dataperpage },
          { $limit: dataperpage },
          {
            $sort:{date:-1}
          }
        ])
        .toArray()
        .then((result) => {
          console.log("all orders",result);
          res.render("admin/orderManagement", { result, count: count });
        });
    });
});

route.post("/orders/update", (req, res) => {
  console.log(req.body);
  con
    .get()
    .collection("orders")
    .updateOne(
      { _id:  ObjectId(req.body.id),"product.product":ObjectId(req.body.model)},
      { $set: { "product.$.status": req.body.status,"product.$.deliverytime":req.body.dtime } }
    )
    .then(() => {
      res.send({ updated: true });
    });
});

route.post("/user/status", (req, res) => {
  con
    .get()
    .collection("user")
    .updateOne(
      { _id:  ObjectId(req.body.id) },
      { $set: { status: req.body.value } }
    )
    .then(() => {
      console.log("done");
      res.send({ updated: true });
    });
  console.log(req.body);
});

route.get("/categories", (req, res) => {
  con
    .get()
    .collection("cat")
    .find({})
    .toArray()
    .then((result) => {
      // console.log(result);
      res.render("admin/categories", { result });
    });
});

route.get("/deletecategory", (req, res) => {
  con
    .get()
    .collection("cat")
    .deleteOne({ _id:  ObjectId(req.query.id) })
    .then((result) => {
      // console.log(result);
      res.redirect("/admin/categories");
    });
});

route.get("/editcat", (req, res) => {
  con
    .get()
    .collection("cat")
    .findOne({ _id:  ObjectId(req.query.id) })
    .then((result) => {
      res.render("admin/editcategory", { result });
      // console.log(result);
    });
});

route.post("/addcat", (req, res) => {

  con.get().collection("cat").findOne({name:req.body.newcat}).then((category)=>{

    if(category || req.body.newcat == ""){
      res.redirect("/admin/categories");
    }else{
      con
      .get()
      .collection("cat")
      .insertOne({ name: req.body.newcat ,offer:0})
      .then(() => {
        res.redirect("/admin/categories");
      });
    }
    
  })


   
});
route.post("/editcat", (req, res) => {
  con
    .get()
    .collection("cat")
    .updateOne(
      { _id:  ObjectId(req.query.id) },
      { $set: { name: req.body.newcat } }
    )
    .then(() => {
      res.redirect("/admin/categories");
    });
});

route.get("/sub-categories",(req,res)=>{
  con.get().collection('categories').find({}).toArray().then((categories)=>{
    // console.log(categories[0].Brands);
    res.render("admin/sub-categories",{categories})
  })
  
})
route.post("/addBrand",(req,res)=>{
  con.get().collection("categories").updateOne({},{$push:{"Brands":{name:req.body.newCategory}}}).then(()=>{
    res.send({added:true})
  });
})
route.post("/deleteBrand",(req,res)=>{
  con.get().collection("categories").updateOne({},{$pull:{"Brands":{name:req.body.brand}}}).then(()=>{
    res.send({added:true})
  });
})

route.post("/addRAM",(req,res)=>{
  con.get().collection("categories").updateOne({},{$push:{"RAM":{storage:req.body.newCategory}}}).then(()=>{
    res.send({added:true})
  });
  // console.log(req.body);
})
route.post("/deleteRAM",(req,res)=>{
  con.get().collection("categories").updateOne({},{$pull:{"RAM":{storage:req.body.storage}}}).then(()=>{
    res.send({added:true})
  });
})
route.post("/addROM",(req,res)=>{
  con.get().collection("categories").updateOne({},{$push:{"ROM":{storage:req.body.newCategory}}}).then(()=>{
    res.send({added:true})
  });
  // console.log("rom called");
})
 


route.get("/reports",(req,res)=>{
  const now=new Date()
  const start=new Date(`${new Date().getFullYear()}`,0,1)
  con.get().collection("orders").find({date:{$lt:now,$gte:start}}).toArray().then((result)=>{
    console.log("new date:",start);
console.log(now);
    res.render("admin/reports",{result,heading:`Sales Report ${moment().format('YYYY')}`})
  })
  
})

route.get("/report/month",(req,res)=>{
  const now=new Date()
  if(now.getMonth==1){
    backMonth=12
    backYear=now.getFullYear()-1
  }
  else{
    backMonth=now.getMonth()-1
    backYear=now.getFullYear()
  }
  const start=new Date(`${backYear},${backMonth},${now.getDate()}`)
    con.get().collection("orders").find({date:{$lt:now,$gt:start}}).toArray().then((result)=>{
      console.log(now);
      console.log(start);
      console.log(result);


      res.render("admin/reports",{result,heading:`Sales Report of  Last 1 Month`})
    })
  

})

route.get("/report/week",(req,res)=>{
  const now=new Date()
  if(now.getMonth!=1)
  {
  if(now.getDate==7){
    nbackday=30
    nbackMonth=now.getMonth()-1
    nbackYear=now.getFullYear()
  }
  else if(now.getDate==6){
    nbackday=29
    nbackMonth=now.getMonth()-1
    nbackYear=now.getFullYear()

  }
  else if(now.getDate==5){
    nbackday=28
    nbackMonth=now.getMonth()-1
    nbackYear=now.getFullYear()

  }
  else if(now.getDate==4){
    nbackday=27
    nbackMonth=now.getMonth()
  }else if(now.getDate==3){
    nbackday=26
    nbackMonth=now.getMonth()-1
    nbackYear=now.getFullYear()

  }
  else if(now.getDate==2){
    nbackday=25
    nbackMonth=now.getMonth()-1
    nbackYear=now.getFullYear()

  }
  else if(now.getDate==1){
    nbackday=24
    nbackMonth=now.getMonth()-1
    nbackYear=now.getFullYear()

  }
  else{
    nbackday=now.getDay()-7
    nbackMonth=now.getMonth()
    nbackYear=now.getFullYear()
  }
}else{
  if(now.getDate==7){
    nbackday=30
    nbackMonth=now.getMonth()-1
    nbackYear=now.getFullYear()-1

  }
  else if(now.getDate==6){
    nbackday=29
    nbackMonth=now.getMonth()-1
    nbackYear=now.getFullYear()-1

  }
  else if(now.getDate==5){
    nbackday=28
    nbackMonth=now.getMonth()-1
    nbackYear=now.getFullYear()-1

  }
  else if(now.getDate==4){
    nbackday=27
    nbackMonth=now.getMonth()-1
    nbackYear=now.getFullYear()-1

  }else if(now.getDate==3){
    nbackday=26
    nbackMonth=now.getMonth()-1
    nbackYear=now.getFullYear()-1

  }
  else if(now.getDate==2){
    nbackday=25
    nbackMonth=now.getMonth()-1
    nbackYear=now.getFullYear()-1

  }
  else if(now.getDate==1){
    nbackday=24
    nbackMonth=now.getMonth()-1
    nbackYear=now.getFullYear()-1

  }
  else{
    nbackday=now.getDay()-7
    nbackMonth=now.getMonth()-1
    nbackYear=now.getFullYear()-1
  }
}
 const start=new Date(`${nbackYear},${nbackMonth},${nbackday}`)
  con.get().collection("orders").find({date:{$lt:now,$gte:start}}).toArray().then((result)=>{
    console.log(result);
    res.render("admin/reports",{result,heading:"Sales Report of Last 7 days"})
  })
  // console.log(formatDate(new Date()));
})

// route.post("/week",(req,res)=>{
//   con.get().collection("orders").find({time:{$lt:new Date(),$gt: new Date("201-01-01")}}).toArray().then((r)=>{
//     res.send(r);
//   })
// })

route.get("/ordersData",(req,res)=>{
  con.get().collection("orders").aggregate([{$match:{}},{$group:{_id:"$method",count:{$sum:1}}},]).toArray().then((orders)=>{
    res.json(orders)
  })
  
})

route.get("/couponmanagement",(req,res)=>{
  con.get().collection("coupons").find().toArray().then(coupons=>{
    console.log(coupons);
    res.render("admin/couponManagement",{coupons})

  })

})

route.get("/addcoupon",(req,res)=>{
  res.render("admin/addcoupon")
})
route.post("/addcoupon",(req,res)=>{
  adminHelpers.addCoupon(req).then(result=>{
    if(result.alreadyThere==true){
      console.log("coupon is alredy there");
      res.redirect("/admin/addcoupon")
    }else{
      res.redirect("/admin/couponmanagement")
      console.log("coupon is inserted");

    }
    
  })
  // console.log(req.body);
})

route.get("/deletecoupon/:id",(req,res)=>{
  couponHelpers.adminCouponDelete(req).then((result)=>{
    if(result.deleted){
      res.redirect("/admin/couponmanagement")
    }
  })
})

route.get("/categoryoffer",(req,res)=>{
  con.get().collection("cat").find().toArray().then(r=>{
     res.render("admin/categoryOffer",{user:req.session.user,r})
  })
 
})
module.exports = route;
