const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const con = require("./config/connection");
const cloudinary = require("cloudinary").v2;
const session = require("express-session");
const flash = require("connect-flash");
const otpgen = require("otp-generators");
const client = require("twilio")(
  "AC310ba1f6e25df76fe77562d899355658",
  "f181af19d88019bab6b437c2aaa7ef68"
);
const moment=require("moment")

const helper = require("./helpers/LoginHelpers");
var base64ToImage = require("base64-to-image");
const paypal = require("paypal-rest-sdk");
const Razorpay = require("razorpay");
const crypto=require("crypto")

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "ASRe872F9Xekn-YKrsWB65y1Y1OirSehIBbNFus5fIkbxrGwWuB2RGB6PAsqjrtXYyduNrH_UHRNaleD",
  client_secret:
    "EI0jsPvICu1X9i4_M65S7KYSqy1Y8EdPngbr6rUUI3Qpcsohp5f9dHJRiuuNhMt_USFXUfgmxqeYIH2z",
});

instance = new Razorpay({
  key_id: "rzp_test_kwZGFuI0hWeY2V",
  key_secret: "b4PuKMMLTh2w0HRjNrKe36Ax",
});

const userRoute = require("./routes/user/user");
const adminRoute = require("./routes/user/admin");
const loginRoute = require("./routes/user/login");
const { ObjectId } = require("mongodb");
const buyProducts = require("./helpers/buyProducts");

cloudinary.config({
  cloud_name: "dem5z7tgz",
  api_key: "315628366858732",
  api_secret: "OV3JdlJ8TaJQUoukAPdmDxxcopA",
});

const storage = multer.diskStorage({
  destination: "./public/uploads",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });

const app = express();
app.use(function (req, res, next) {
  if (!req.user) {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.header("Expires", "-1");
    res.header("Pragma", "no-cache");
  }
  console.log(req.user);
  next();
});
app.use(
  session({
    secret: "key",
    saveUninitialized: false,
    cookie: { maxAge: 6000000 },
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(flash());
con.connect();
app.set("view engine", "ejs");
app.use(express.static("./assets/css"));

app.use("/home", userRoute);
app.use("/admin", adminRoute);
app.use("/login", loginRoute);

async function uploadToCloudinary(locaFilePath) {
  var mainFolder = "main";
  var filePathOnCloudinary = mainFolder + "/" + locaFilePath;
  return cloudinary.uploader
    .upload(locaFilePath, { public_id: filePathOnCloudinary })
    .then((result) => {
      return {
        message: "done",
        url: result.url,
      };
    });
}
app.post("/payment", async(req, res) => {
  address=JSON.parse(req.body.address)
  ID=req.body.ID;
  const product=await con.get().collection("Products").findOne({_id:ObjectId(req.body.id)})
  if (req.body.payment == "razorpay") {
    console.log(product);
    console.log("this sis discount",Number(product.price));
console.log("this is final after discount",Number(product.price)-Number(product.price)*Number(req.body.discount)/100);
    console.log("chose razorpay");
  
    con
      .get()
      .collection("orders")
      .insertOne({
        product: [{product:ObjectId(req.body.id),count:1}],
        user: req.session.user.name,
        method: "razorpay",
        status: "pending",
        paymentstatus: "pending",
        address: address,
        time:moment().format("L"),
          date:moment().toDate(),
        quantity: 1,
        coupon:ID?ID:null,
        total:Math.ceil(Number(product.price)-Number(product.price)*Number(req.body.discount)/100),
      })
      .then((re) => {
        globalobjrezorid=re.insertedId;
        var options = {
          amount:(Number(product.price)-Number(product.price)*Number(req.body.discount)/100)*100, // amount in the smallest currency unit
          currency: "INR",
          receipt: re.insertedId + "",
        };
        instance.orders.create(options, function (err, order) {
          if(err){
            console.log(err);
          }
          else
          {
            console.log(order);
            res.send(order)
          }
          
        });
      });
  } else if (req.body.payment == "paypal") {
    console.log("this is body",req.body);
    console.log("you chose paypal");
  


    var create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: "http://localhost:3000/success",
        cancel_url: "http://localhost:3000/failed",
      },
      transactions: [
        {
          
          amount: {
            currency: "USD",
            total:Math.ceil(Number(product.price)-Number(product.price)*Number(req.body.discount)/100),
          },
          description: "This is the payment description.",
        },
      ],
    };
    paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
        throw error
      } else {
        // console.log(payment);
        for (let i = 0; i < payment.links.length; i++) {
          if (payment.links[i].rel === "approval_url") {
            // res.redirect(payment.links[i].href);
            res.send({paypal:payment.links[i].href})
          }
        }
        coupon=req.body.ID
        con
          .get()
          .collection("orders")
          .insertOne({
            product: [{product:ObjectId(req.body.id),count:1}],
            user: req.session.user.name,
            method: "paypal",
            status: "pending",
            coupon:req.body.ID?req.body.ID:null, 
            paymentstatus: "pending",
            address: address,
            time:moment().format("L"),
            date:moment().toDate(),
            quantity:1,
            total:Math.ceil(Number(product.price)-Number(product.price)*Number(req.body.discount)/100),
            Coupon:ID?ID:null
          })
          .then((r) => {
            globalobjid = r.insertedId;
            con.get().collection("coupons").updateOne({ID:ID},{$push:{users:req.session.user._id}})
          });
      }
    });
    app.get("/success", (req, res) => {
      const payerId = req.query.PayerID;
      const paymentId = req.query.paymentId;

      const execute_payment_json = {
        payer_id: payerId,
      };

      // Obtains the transaction details from paypal
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
            // res.send("Success");
            con
              .get()
              .collection("orders")
              .updateOne(
                { _id: globalobjid },
                { $set: { paymentstatus: "success", status: "placed" } }
              )
              .then(() => {
                console.log("updated successfully");
                con.get().collection("coupons").updateOne({ID:coupon},{$push:{users:req.session.user._id}}).then(()=>{
                  res.render("user/success",{user:req.session.user})
                })
                
              });
          }
        }
      );
    });
  }
});
app.get("/failed",(req,res)=>{
  con.get().collection("orders").updateOne({ _id: globalobjid },{ $set: { paymentstatus: "failed", status: "pending" } }).then(()=>{
    res.render("user/paymentfailed")
  })
})
app.post("/varifyPayment",(req,res)=>{
let hmac=crypto.createHmac('sha256','b4PuKMMLTh2w0HRjNrKe36Ax')
hmac.update(req.body['payment[razorpay_order_id]']+'|'+req.body['payment[razorpay_payment_id]']);
 hmac=hmac.digest('hex')
if(hmac==req.body['payment[razorpay_signature]']){
   con.get().collection("orders").updateOne({_id:globalobjrezorid},{$set:{status:"placed",paymentstatus:"success"}}).then((e)=>{
    console.log("this is after razorpay success");
   })
}
else{
  con.get().collection("orders").updateOne({_id:globalobjrezorid},{$set:{status:"failed payment"}}).then((e)=>{
    console.log("this is after razorpay fAiled");
   })
}
})

// app.post("/placeorder", (req, res) => {
//   var instance = new Razorpay({
//     key_id: "rzp_test_Zh6pjzUFwDGrQD",
//     key_secret: "YPOZcl2ZZAHkr6dwZaDTaQwA",
//   });
//   var options = {
//     amount: 45621,
//     currency: "INR",
//     receipt: "46sd4",
//   };
//   instance.orders.create(options, function (err, order) {
//     if (err) {
//       console.log(err);
//     }
//     console.log("new order:", order);
//     res.send({orderid:order.id});
//   });
// });

app.post("otp-send", (req, res) => {});

app.post(
  "/admin/products/add",
  upload.any("myImage"),
  async (req, res, next) => {
    // console.log(req.body);
    con
      .get()
      .collection("Products")
      .insertOne(req.body)
      .then((response) => {
        console.log("details updated");
        // console.log(response.insertedId);
        globalid = response.insertedId;
      });
    for (var i = 0; i < req.files.length; i++) {
      var locaFilePath = req.files[i].path;

      if (req.files[i].fieldname == "mainImage") {
        uploadToCloudinary(locaFilePath).then((r) => {
          con
            .get()
            .collection("Products")
            .updateOne({ _id: globalid }, { $set: { mainImage: r.url } })
            .then((err, res) => {
              console.log(err);
            });
        });
      }

      // var locaFilePath = req.files[i].path;
      uploadToCloudinary(locaFilePath)
        .then((result) => {
          con
            .get()
            .collection("Products")
            .updateOne({ _id: globalid }, { $push: { images: result.url } })
            .then(() => {
              console.log("req url:" + result.url);
              console.log("done");
            });
        })
        .then(() => {
          res.redirect("/admin/products");
          console.log(req.body);
        })

        .catch((er) => {
          console.log(er);
        });
    }
  }
);

app.get("/adminlogin", (req, res) => {
  msg = req.flash("info");
  res.render("admin/adminLogin");
});

app.post("/adminlogin", (req, res) => {
  helper.adminLoginValidator(req.body).then((result) => {
    if (result.adminlogged == true) {
      req.session.adminlogged = true;
      res.redirect("/admin");
    } else {
      req.flash("info", "incorrect Username or password");
      res.redirect("/adminlogin");
    }
  });
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

app.get("/", (req, res) => {
  if (req.session.user) {
    res.redirect("/home");
  } else {
    res.redirect("/login");
  }
});

app.post("/otp-auth", (req, res) => {
  if (req.body.mobile === otp) {
    req.session.user = ress;
    res.redirect("/home");
  } else {
    req.flash("info", "ivalid otp!retry");
    res.redirect("/otp-login");
  }
});

app.get("/register", (req, res) => {
  var msg = req.flash("info");
  res.render("user/userRegister", { msg });
});

app.post("/register", (req, res) => {
  const { user, mobile, email, password, confirm } = req.body;
  con
    .get()
    .collection("user")
    .findOne({ $or: [{ mobile: req.body.mobile }, { email: req.body.email }] })
    .then((result) => {
      if (
        req.body.user == "" ||
        req.body.mobile == "" ||
        req.body.email == "" ||
        req.body.password == "" ||
        req.body.confirm == ""
      ) {
        req.flash("info", "please fill all fields");
        res.redirect("/register");
      } else if (req.body.password != req.body.confirm) {
        req.flash("info", "password and confirm password should be same!");
        res.redirect("/register");
      } else if (result) {
        req.flash("info", "Mobile number or email is already used");
        res.redirect("/register");
      } else {
        helper.userSignupValidator(req.body).then(() => {
          console.log("regsitered");
          req.flash("info2", "user registered successfully");
          res.redirect("/login");
        });
      }
    });
});
app.post("/admin/products/edit", (req, res) => {
  con
    .get()
    .collection("Products")
    .updateOne(
      { _id: new ObjectId(req.query.id) },
      {
        $set: {
          model: req.body.model,
          brand: req.body.brand,
          ROM: req.body.ROM,
          RAM: req.body.RAM,
          stock: req.body.stock,
          rating: req.body.rating,
          highlights: req.body.highlights,
          description: req.body.description,
          category: req.body.category,
        },
      }
    )
    .then(() => {
      console.log("data updated");
      res.redirect("/admin/products");
    });
});

app.listen(3000, () => {
  console.log("server started");
});
