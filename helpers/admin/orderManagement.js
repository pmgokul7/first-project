const db = require("../../config/connection");
const {ObjectId} = require("mongodb");
const collectionNames = require("../../config/collectionNames");

module.exports = {
    getAllOrders: (data) => {
        return new Promise(async (resolve, reject) => {
            const page = data.query.p || 0;
            const dataperpage = 10;
            db.get().collection(collectionNames.ORDERS_COLLECTION).countDocuments().then((count) => {
                db.get().collection(collectionNames.ORDERS_COLLECTION).aggregate([
                    {
                        $match: {}
                    },
                    {
                        $unwind: "$product"
                    },
                    {
                        $lookup: {
                            from: "Products",
                            localField: "product.product",
                            foreignField: "_id",
                            as: "p"
                        }
                    },
                    {
                        $skip: page * dataperpage
                    }, {
                        $limit: dataperpage
                    }, {
                        $sort: {
                            date: -1
                        }
                    },
                ]).toArray().then((result) => {
                    // console.log("all orders", result);
                    // res.render("admin/orderManagement", {result, count: count});
                    resolve({result, count});
                });
            });
        });
    },
    orderUpdate: (data) => {
        return new Promise(async (resolve, reject) => {
            try { // console.log(req.body);
                db.get().collection(collectionNames.ORDERS_COLLECTION).updateOne({
                    _id: ObjectId(data.body.id),
                    "product.product": ObjectId(data.body.model)
                }, {
                    $set: {
                        "product.$.status": data.body.status,
                        "product.$.deliverytime":data.body.statusDate
                    }
                }).then(() => {
                    resolve({updated: true});
                    console.log("daaaaaaaate",new Date());
                });
                console.log("daaaaaaaate",new Date());
                console.log("daaaaaaaate",data.body.statusDate);
            } catch (err) {
                reject(err)
            }
        })
    }
};
