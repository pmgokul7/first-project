require("dotenv").config()
const express = require("express");

const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const con = require("./config/connection");
const cloudinary = require("cloudinary").v2;
const session = require("express-session");
const flash = require("connect-flash");
// const otpgen = require("otp-generators");
// const client = require("twilio")("AC310ba1f6e25df76fe77562d899355658", "f181af19d88019bab6b437c2aaa7ef68");

const helper = require("./helpers/LoginHelpers");
const paypal = require("paypal-rest-sdk");
const Razorpay = require("razorpay");

paypal.configure({
    mode: "sandbox", // sandbox or live
    client_id: "ASRe872F9Xekn-YKrsWB65y1Y1OirSehIBbNFus5fIkbxrGwWuB2RGB6PAsqjrtXYyduNrH_UHRNaleD",
    client_secret: "EI0jsPvICu1X9i4_M65S7KYSqy1Y8EdPngbr6rUUI3Qpcsohp5f9dHJRiuuNhMt_USFXUfgmxqeYIH2z"
});

instance = new Razorpay({key_id: "rzp_test_kwZGFuI0hWeY2V", key_secret: "b4PuKMMLTh2w0HRjNrKe36Ax"});

const userRoute = require("./routes/user/user");
const adminRoute = require("./routes/user/admin");
const loginRoute = require("./routes/user/login");
const {ObjectId} = require("mongodb");
const buyProducts = require("./helpers/buyProducts");

cloudinary.config({cloud_name: process.env.CLOUD_NAME, api_key: process.env.CLOUD_API_KEY, api_secret:process.env.CLOUD_API_SECRET});

const storage = multer.diskStorage({
    destination: "./public/uploads",
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({storage: storage});

const app = express();

app.use(session({
    secret: "key",
    saveUninitialized: false,
    cookie: {
        maxAge: 6000000
    }
}));
app.use(function (req, res, next) {
    console.log("stw",req.user);
    if (req.session.user) {
        res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
        res.header("Expires", "-1");
        res.header("Pragma", "no-cache");
        console.log("done");
    }else{
        console.log(process.env.CLOUD_NAME);
    }
  
    next();
});
app.use(bodyParser.urlencoded({extended: false}));
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
    return cloudinary.uploader.upload(locaFilePath, {public_id: filePathOnCloudinary}).then((result) => {
        return {message: "done", url: result.url};
    });
}


app.post("/admin/products/add", upload.any("myImage"), async (req, res, next) => {

    console.log("this is files",req.files);
    console.log("length",req.files.length);
        con.get().collection("Products").insertOne({
        model: req.body.model,
        brand: req.body.brand,
        ROM: req.body.ROM,
        RAM: req.body.RAM,
        category: req.body.category,
        stock: parseInt(req.body.stock),
        price: parseInt(req.body.price),
        offerprice: parseInt(req.body.price),
        rating: parseInt(req.body.rating),
        color: req.body.color,
        OS: req.body.OS,
        highlights: req.body.highlights,
        description: req.body.description,
        isDeleted: false,
        added: new Date()

    }).then((response) => {
        console.log("details updated");
        globalid = response.insertedId;
    });
    for (var i = 0; i < req.files.length; i++) {
        var locaFilePath = req.files[i].path;
        console.log("this is files",req.files);
        if (req.files[i].fieldname == "mainImage") {
            uploadToCloudinary(locaFilePath).then((r) => {
                con.get().collection("Products").updateOne({
                    _id: globalid
                }, {
                    $set: {
                        mainImage: r.url
                    }
                })
            });
        }else if(req.files[i].fieldname == "image"){
            uploadToCloudinary(locaFilePath).then((r) => {
                con.get().collection("Products").updateOne({
                    _id: globalid
                }, {
                    $addToSet: {
                        images: r.url
                    }
                }).then((err, res) => {
                    console.log(i,":pushed");
                });
            });  
        }

        // var locaFilePath = req.files[i].path;
        // uploadToCloudinary(locaFilePath).then((result) => {
        //     con.get().collection("Products").updateOne({
        //         _id: globalid
        //     }, {
        //         $push: {
        //             images: result.url
        //         }
        //     }).then(() => {
        //         console.log("req url:" + result.url);
        //         console.log("done");
        //     });
        // }).then(() => {
        //     // res.redirect("/admin/products");
        //     // console.log(req.body);
        // }).catch((er) => {
        //     console.log(er);
        // });
    }
});

app.get("/adminlogin", (req, res) => {
    var msg = req.flash("info");
    res.render("admin/adminLogin", {msg});
});

app.post("/adminlogin", (req, res) => {
    if (req.body.password != "" && req.body.mobile != "") {
        helper.adminLoginValidator(req.body).then((result) => {
            if (result.adminlogged == true) {
                req.session.adminlogged = true;
                res.redirect("/admin");
            } else {
                req.flash("info", "incorrect Username or password");
                res.redirect("/adminlogin");
            }
        });
    } else {
        req.flash("info", "all fields should be filled");
        res.redirect("/adminlogin");
    }

});

app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/home");
});

app.get("/", (req, res) => {
    
        res.redirect("/home");
   
});

app.post("/otp-auth", (req, res) => {
    if (req.body.mobile === otp) {
        req.session.user = ress;
        console.log("this workrd");
        res.redirect("/");
    } else {
        req.flash("info", "ivalid otp!retry");
        res.redirect("/login/otp-login");
    }
});

app.get("/register", (req, res) => {
    var msg = req.flash("info");
    res.render("user/userRegister", {msg});
});

app.post("/register", (req, res) => {
    const {
        user,
        mobile,
        email,
        password,
        confirm
    } = req.body;
    con.get().collection("user").findOne({
        $or: [
            {
                mobile: req.body.mobile
            }, {
                email: req.body.email
            }
        ]
    }).then((result) => {
        if (req.body.user == "" || req.body.mobile == "" || req.body.email == "" || req.body.password == "" || req.body.confirm == "") {
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
app.post("/admin/products/edit", upload.any("myImage"), (req, res) => {
    console.log("files",req.files);
    con.get().collection("Products").updateOne({
        _id: new ObjectId(req.query.id)
    }, {
        $set: {
            model: req.body.model,
            brand: req.body.brand,
            ROM: req.body.ROM,
            RAM: req.body.RAM,
            category: req.body.category,
            stock: parseInt(req.body.stock),
            price: parseInt(req.body.price),
            offerprice: parseInt(req.body.offerprice),
            rating: parseInt(req.body.rating),
            color: req.body.color,
            highlights: req.body.highlights,
            description: req.body.description
        }
    }).then((ns) => {
        insertedID = ns
        console.log("ooo", ns);
        for (var i = 0; i < req.files.length; i++) {
            var locaFilePath = req.files[i].path;

            if (req.files[i].fieldname == "mainImage") {
                uploadToCloudinary(locaFilePath).then((img) => {
                    console.log("this is imagurl", img.url);
                    con.get().collection("Products").updateOne({
                        _id: ObjectId(req.query.id)
                    }, {
                        $set: {
                            mainImage: img.url
                        }
                    }).then((resa) => {
                        con.get().collection("Products").updateOne({_id: ObjectId(req.query.id)},{$push:{
                            images:resa.url
                            }})
                        

                        console.log(resa);
                    });
                });
            }else if(req.files[i].fieldname == "image"  || req.files[i].fieldname == "mainImage"){
                uploadToCloudinary(locaFilePath).then((r) => {
                    
                        con.get().collection("Products").updateOne({
                            _id:  ObjectId(req.query.id)
                        }, {
                            $push: {
                                images:{
                                $position:i,
                                $each:[r.url]
                                }
                            }
                        })
                        console.log(i,":pushed");
                        // res.redirect("/admin/products");
                    
                }); 
            }

            // var locaFilePath = req.files[i].path;
            // uploadToCloudinary(locaFilePath)
            // .then((result) => {
            //     con
            //       .get()
            //       .collection("Products")
            //       .updateOne({ _id: globalid }, { $push: { images: result.url } })
            //       .then(() => {
            //         console.log("req url:" + result.url);
            //         console.log("done");
            //       });
            // })
            // .then(() => {
            //     res.redirect("/admin/products");
            //     console.log(req.body);
            // })

            // .catch((er) => {
            //     console.log(er);
            // });
        }
    });
});

app.listen(3000, () => {
    console.log("server started");
});
