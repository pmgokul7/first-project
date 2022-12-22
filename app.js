require("dotenv").config()
const express = require("express");

const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const connection = require("./config/connection");
const session = require("express-session");
const flash = require("connect-flash");


const helper = require("./helpers/LoginHelpers");
const paymentHel=require("./helpers/paymentHelpers")
const Razorpay = require("razorpay");


instance = new Razorpay({key_id: "rzp_test_kwZGFuI0hWeY2V", key_secret: "b4PuKMMLTh2w0HRjNrKe36Ax"});

const HomeRoute = require("./routes/user/home");
const userRoute = require("./routes/user/user")
const adminRoute = require("./routes/user/admin");
const loginRoute = require("./routes/user/login");
const {ObjectId} = require("mongodb");

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
app.use(express.static(path.join(__dirname, '/assets')));
app.use(session({
    secret: "key",
    saveUninitialized: false,
    cookie: {
        maxAge: 6000000
    }
}));
app.use(function (req, res, next) {
    if (req.session.user) {
        res.setHeader("Cache-Control", "private, no-cache, no-store, must-revalidate");
        res.setHeader("Expires", "-1");
        res.setHeader("Pragma", "no-cache");
        next()
    } else {
        next()
    }
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


app.post("/admin/products/add", upload.any("myImage"), async (req, res, next) => {

    const response = await connection.get().collection("Products").insertOne({
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
        OS: req.body.OS,
        highlights: req.body.highlights,
        description: req.body.description,
        isDeleted: false,
        added: new Date()

    })
    globalid = response.insertedId;

    req.files.map(async (file) => {
        switch (file.fieldname) {
            case "mainImage":
                var locaFilePath = file.path;
                const r = await connection.uploadToCloudinary(locaFilePath)
                await connection.get().collection("Products").updateOne({
                    _id: globalid
                }, {
                    $set: {
                        mainImage: r.url
                    }
                })
                break;

            case "image1":
                var locaFilePath = file.path;
                const images = await connection.uploadToCloudinary(locaFilePath)
                await connection.get().collection("Products").updateOne({
                    _id: globalid
                }, {
                    $set: {
                        image1: images.url
                    }
                })
                break;
            case "image2":
                var locaFilePath = file.path;
                var images2 = await connection.uploadToCloudinary(locaFilePath)
                await connection.get().collection("Products").updateOne({
                    _id: globalid
                }, {
                    $set: {
                        image2: images2.url
                    }
                })
                console.log(images2.url);

                break;
            case "image3":
                var locaFilePath = file.path;
                var images3 = await connection.uploadToCloudinary(locaFilePath)
                await connection.get().collection("Products").updateOne({
                    _id: globalid
                }, {
                    $set: {
                        image3: images3.url
                    }
                })
                break;

        }


    })
    res.redirect("/admin/products")


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


app.get("/", (req, res) => {

    res.redirect("/home");

});

app.post("/otp-auth", (req, res) => {
    if (req.body.mobile === otp) {
        req.session.user = ress;
        res.redirect("/");
    } else {
        req.flash("info", "ivalid otp!retry");
        res.redirect("/login/otp-login");
    }
});

app.post("/admin/products/edit", upload.any("myImage"), async (req, res) => {
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
    req.files.map(async file => {
        if (file.fieldname == "mainImage") {
            var locaFilePath = file.path;
            const r = await connection.uploadToCloudinary(locaFilePath)
            await connection.get().collection("Products").updateOne({
                _id: new ObjectId(req.query.id)
            }, {
                $set: {
                    mainImage: r.url
                }
            })


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


        } else if (file.fieldname == "image2") {
            var locaFilePath = file.path;
            const images = await connection.uploadToCloudinary(locaFilePath)
            await connection.get().collection("Products").updateOne({
                _id: new ObjectId(req.query.id)
            }, {
                $set: {
                    image2: images.url
                }
            })
        } else if (file.fieldname == "image3") {
            var locaFilePath = file.path;
            const images = await connection.uploadToCloudinary(locaFilePath)
            await connection.get().collection("Products").updateOne({
                _id: new ObjectId(req.query.id)
            }, {
                $set: {
                    image3: images.url
                }
            })
        }
    })
    res.redirect("/admin/products")


});
app.get("*", (req, res) => {
    res.render("user/404")
})


app.listen(process.env.PORT || 3001, () => {
    console.log("server started");
});
