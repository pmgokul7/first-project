require("dotenv").config()
const express = require("express");

const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const connection = require("./config/connection");
const cloudinary = require("cloudinary").v2;
const session = require("express-session");
const flash = require("connect-flash");


const loginHelper = require("./helpers/LoginHelpers")
// const otpgen = require("otp-generators");
const client = require("twilio")("AC310ba1f6e25df76fe77562d899355658", "f181af19d88019bab6b437c2aaa7ef68");

const helper = require("./helpers/LoginHelpers");
// const paypal = require("paypal-rest-sdk");
const Razorpay = require("razorpay");

// paypal.configure({
//     mode: "sandbox", // sandbox or live
//     client_id: "ASRe872F9Xekn-YKrsWB65y1Y1OirSehIBbNFus5fIkbxrGwWuB2RGB6PAsqjrtXYyduNrH_UHRNaleD",
//     client_secret: "EI0jsPvICu1X9i4_M65S7KYSqy1Y8EdPngbr6rUUI3Qpcsohp5f9dHJRiuuNhMt_USFXUfgmxqeYIH2z"
// });

instance = new Razorpay({key_id: "rzp_test_kwZGFuI0hWeY2V", key_secret: "b4PuKMMLTh2w0HRjNrKe36Ax"});

const HomeRoute = require("./routes/user/home");
const userRoute = require("./routes/user/user")
const adminRoute = require("./routes/user/admin");
const loginRoute = require("./routes/user/login");
const {ObjectId} = require("mongodb");
const buyProducts = require("./helpers/buyProducts");

// cloudinary.config({cloud_name: process.env.CLOUD_NAME, api_key: process.env.CLOUD_API_KEY, api_secret:process.env.CLOUD_API_SECRET});
connection.cloudinaryConfig()
const storage = multer.diskStorage({
    destination: "./public/uploads",
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({storage: storage});

const app = express();
// connection.mail()
app.use(express.static('assets'))
app.use(session({
    secret: "key",
    saveUninitialized: false,
    cookie: {
        maxAge: 6000000
    }
}));
app.use(function (req, res, next) {
    console.log("stw", req.user);
    if (req.session.user) {
        res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
        res.header("Expires", "-1");
        res.header("Pragma", "no-cache");
        console.log("done");
    } else {
        console.log(process.env.CLOUD_NAME);
    } next();
});
app.use(bodyParser.urlencoded({extended: false}));
app.use(flash());
connection.connect();
connection.payPalConfig()
app.set("view engine", "ejs");


app.use("/home", HomeRoute);
app.use("/admin", adminRoute);
app.use("/login", loginRoute);
app.use("/user", userRoute);

// async function uploadToCloudinary(locaFilePath) {
//     var mainFolder = "main";
//     var filePathOnCloudinary = mainFolder + "/" + locaFilePath;
//     return cloudinary.uploader.upload(locaFilePath, {public_id: filePathOnCloudinary}).then((result) => {
//         return {message: "done", url: result.url};
//     });
// }


app.post("/admin/products/add", upload.any("myImage"), async (req, res, next) => {

    console.log(req.files);
    console.log(req.files.length);
    const response = await connection.get().collection("Products").insertOne({
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

    })
    console.log("details updated");
    globalid = response.insertedId;

    // for ( i = 0; i < req.files.length; i++) {
    req.files.map(async (file) => {
        if (file.fieldname == "mainImage") {
            var locaFilePath = file.path;
            const r = await connection.uploadToCloudinary(locaFilePath)
            await connection.get().collection("Products").updateOne({
                _id: globalid
            }, {
                $set: {
                    mainImage: r.url
                }
            })
            console.log("main pushed");


        } else if (file.fieldname == "image1") {

            var locaFilePath = file.path;
            const images = await connection.uploadToCloudinary(locaFilePath)
            await connection.get().collection("Products").updateOne({
                _id: globalid
            }, {
                $set: {
                    image1: images.url
                }
            })
            // console.log(i, ":sub pushed");
            console.log(images.url);


        }else if(file.fieldname == "image2") {
            var locaFilePath = file.path;
            const images = await connection.uploadToCloudinary(locaFilePath)
            await connection.get().collection("Products").updateOne({
                _id: globalid
            }, {
                $set: {
                    image2: images.url
                }
            })
            // console.log(i, ":sub pushed");
            console.log(images.url);
        }else if(file.fieldname == "image3") {
            var locaFilePath = file.path;
            const images = await connection.uploadToCloudinary(locaFilePath)
            await connection.get().collection("Products").updateOne({
                _id: globalid
            }, {
                $set: {
                    image3: images.url
                }
            })
            // console.log(i, ":sub pushed");
            console.log(images.url);
        }
    })
    res.redirect("/admin/products")


    // console.log("this is files",i);
    // if (req.files[i].fieldname == "mainImage") {
    //     var locaFilePath = req.files[i].path;
    // const r= await connection.uploadToCloudinary(locaFilePath)
    //        await connection.get().collection("Products").updateOne({
    //             _id: globalid
    //         }, {
    //             $set: {
    //                 mainImage: r.url
    //             }
    //         })
    //         console.log("main pushed");


    // }
    //      else{

    //         var locaFilePath = req.files[i].path;
    //         const images=await connection.uploadToCloudinary(locaFilePath)
    //           await connection.get().collection("Products").updateOne({
    //                 _id: globalid
    //             }, {
    //                 $set: {
    //                     sub1:{ image: images.url}
    //                 }
    //             })
    //                 console.log(i,":sub pushed");
    //                 console.log(images.url);


    // }
    // }


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

app.post("/admin/products/edit", upload.any("myImage"), async (req, res) => {
    console.log("files", req.files);
    const ns = await connection.get().collection("Products").updateOne({
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
    })
    insertedID = ns
    console.log("ooo", ns);
    req.files.map(async file=>{
        console.log("this is file",file);
        if (file.fieldname == "mainImage") {
            console.log("main detected",ns);
            var locaFilePath = file.path;
            const r = await connection.uploadToCloudinary(locaFilePath)
            await connection.get().collection("Products").updateOne({
                _id:  new ObjectId(req.query.id)
            }, {
                $set: {
                    mainImage: r.url
                }
            })
            console.log("main pushed");


        } else if (file.fieldname == "image1") {

            var locaFilePath = file.path;
            const images = await connection.uploadToCloudinary(locaFilePath)
            await connection.get().collection("Products").updateOne({
                _id: new ObjectId(req.query.id)
            }, {
                $set: {
                    image1: images.url
                }
            })
            // console.log(i, ":sub pushed");
            console.log(images.url);


        }else if(file.fieldname == "image2") {
            var locaFilePath = file.path;
            const images = await connection.uploadToCloudinary(locaFilePath)
            await connection.get().collection("Products").updateOne({
                _id: new ObjectId(req.query.id)
            }, {
                $set: {
                    image2: images.url
                }
            })
            // console.log(i, ":sub pushed");
            console.log(images.url);
        }else if(file.fieldname == "image3") {
            var locaFilePath = file.path;
            const images = await connection.uploadToCloudinary(locaFilePath)
            console.log("url",images.url);
            await connection.get().collection("Products").updateOne({
                _id: new ObjectId(req.query.id)
            }, {
                $set: {
                    image3: images.url
                }
            })
            // console.log(i, ":sub pushed");
            console.log(images.url);
        }
    })
    res.redirect("/admin/products")
    // for (var i = 0; i < req.files.length; i++) {
    //     var locaFilePath = req.files[i].path;

    //     if (req.files[i].fieldname == "mainImage") {
    //         const img = await connection.uploadToCloudinary(locaFilePath)

    //         const resa = await connection.get().collection("Products").updateOne({
    //             _id: ObjectId(req.query.id)
    //         }, {
    //             $set: {
    //                 mainImage: img.url
    //             }
    //         })
    //         await connection.get().collection("Products").updateOne({
    //             _id: ObjectId(req.query.id)
    //         }, {
    //             $push: {
    //                 images: resa.url
    //             }
    //         })


    //     } else if (req.files[i].fieldname == "image" || req.files[i].fieldname == "mainImage") {
    //         const r = await connection.uploadToCloudinary(locaFilePath)

    //         await connection.get().collection("Products").updateOne({
    //             _id: ObjectId(req.query.id)
    //         }, {
    //             $push: {
    //                 images: {
    //                     $position: i,
    //                     $each: [r.url]
    //                 }
    //             }
    //         })
    //         console.log(i, ":pushed");
    //         // res.redirect("/admin/products");


    //     }


    // }

});
app.get("*", (req, res) => {
    res.send("404")
})
app.listen(process.env.PORT || 3001, () => {
    console.log("server started");
});
