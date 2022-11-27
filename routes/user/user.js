const express = require("express")
const route = express.Router()
const connection = require("../../config/connection")
const helper = require("../../helpers/LoginHelpers")

route.get("/register", (req, res) => {

    var msg = req.flash("info");
    res.render("user/userRegister", {msg});

})

route.post("/register", async (req, res) => {

    console.log("this");
    connection.get().collection("user").findOne({
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
            res.redirect("/user/register");
        } else if (req.body.password != req.body.confirm) {
            req.flash("info", "password and confirm password should be same!");
            res.redirect("/user/register");
        } else if (result) {
            req.flash("info", "Mobile number or email is already used");
            res.redirect("/user/register");
        } else {
            helper.userSignupValidator(req.body).then((r) => {
                console.log("in thi", result);
                req.flash("info2", "user registered successfully");
                res.redirect("/login");

            });
        }
    });
});

module.exports = route
