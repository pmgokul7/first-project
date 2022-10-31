const express = require("express");
const { ObjectId } = require("mongodb");
const route = express.Router();
const con = require("../../config/connection");
const helper = require("../../helpers/adminHelpers");

route.use(function (req, res, next) {
  if (req.session.adminlogged) {
    next();
  } else {
    // res.redirect("/adminlogin")
    next();
  }
});

route.get("/", (req, res) => {
  res.render("admin/adminDash");
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
    .findOne({ _id: new ObjectId(req.query.id) })
    .then((result) => {
      res.render("admin/edituser", { result });
    });
});

route.get("/users/delete", (req, res) => {
  con
    .get()
    .collection("user")
    .deleteOne({ _id: new ObjectId(req.query.id) })
    .then(() => {
      res.redirect("/admin/users");
    });
});

route.get("/products/edit", (req, res) => {
  con
    .get()
    .collection("Products")
    .findOne({ _id: new ObjectId(req.query.id) })
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
      { _id: new ObjectId(req.query.id) },
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
          {
            $lookup: {
              from: "Products",
              localField: "product",
              foreignField: "_id",
              as: "p",
            },
          },
          { $skip: page * dataperpage },
          { $limit: dataperpage },
        ])
        .toArray()
        .then((result) => {
          console.log(result[0]);
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
      { _id: new ObjectId(req.body.orderid) },
      { $set: { status: req.body.status } }
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
      { _id: new ObjectId(req.body.id) },
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
    .deleteOne({ _id: new ObjectId(req.query.id) })
    .then((result) => {
      // console.log(result);
      res.redirect("/admin/categories");
    });
});

route.get("/editcat", (req, res) => {
  con
    .get()
    .collection("cat")
    .findOne({ _id: new ObjectId(req.query.id) })
    .then((result) => {
      res.render("admin/editcategory", { result });
      // console.log(result);
    });
});

route.post("/addcat", (req, res) => {
  if (req.body.newcat == "") {
    res.redirect("/admin/categories");
  } else {
    con
      .get()
      .collection("cat")
      .insertOne({ name: req.body.newcat })
      .then(() => {
        res.redirect("/admin/categories");
      });
  }
});
route.post("/editcat", (req, res) => {
  con
    .get()
    .collection("cat")
    .updateOne(
      { _id: new ObjectId(req.query.id) },
      { $set: { name: req.body.newcat } }
    )
    .then(() => {
      res.redirect("/admin/categories");
    });
});
module.exports = route;
