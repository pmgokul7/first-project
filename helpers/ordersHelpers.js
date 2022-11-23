const db = require("../config/connection");
const {ObjectId} = require("mongodb");
const collectionNames = require("../config/collectionNames");


module.exports = {
    userOrders: (data) => {
        return new Promise(async (resolve, reject) => {
            var result = await db.get().collection(collectionNames.ORDERS_COLLECTION).aggregate([
                {
                    $match: {
                        user: data.session.user.name,
                        paymentstatus: "success"
                    }
                },
                // {$unwind:"$product"},
                {
                    $lookup: {
                        from: "Products",
                        localField: "product.product",
                        foreignField: "_id",
                        as: "p"
                    }
                }, {
                    $sort: {
                        date: -1
                    }
                },
            ]).toArray()

            db.get().collection(collectionNames.ORDERS_COLLECTION).find({user: data.session.user.name}).toArray().then(orderResult => {
                console.log("unwind result orders", result);
                resolve({result, orderResult});
            })


        })
    },
    returnProducts: (data) => {
        return new Promise(async (resolve, reject) => {
            const order = await db.get().collection("orders").findOne({
                _id: ObjectId(data.body.id),
                "product.product": ObjectId(data.body.model)
            })
            await db.get().collection("orders").updateOne({
                _id: ObjectId(data.body.id),
                "product.product": ObjectId(data.body.model)
            }, {
                $set: {
                    "product.$.status": "returned"
                }
            })
            console.log(order);
            await db.get().collection("user").updateOne({
                _id: ObjectId(data.session.user._id)
            }, {
                $inc: {
                    wallet: order.walletAmount + order.total
                }
            })
            resolve({return: true})
        })

    },
    cancelOrders: (data) => {
        return new Promise(async (resolve, reject) => {
            if (data.body.discount == "") {
                disc = 0;
            } else {
                disc = data.body.discount;
            }
            console.log("this is body from cancel order", data.body);
            var e = await db.get().collection("orders").updateOne({
                _id: ObjectId(data.body.id),
                "product.product": ObjectId(data.body.model)
            }, {
                $set: {
                    "product.$.status": "cancelled"
                }
            })
            if (e.modifiedCount != 0) { // res.send({cancelled: true});
                resolve({cancelled: true})
                var pro = await db.get().collection("Products").findOne({
                    _id: ObjectId(data.body.model)
                })
                if (pro) {
                    walletAmount = Number(data.body.count) * parseInt(pro.offerprice) - (parseInt(pro.offerprice) * parseInt(disc)) / 100;
                    console.log("this is wallet amount", walletAmount);
                    if (data.body.method != "COD") {
                        await db.get().collection("user").updateOne({
                            _id: ObjectId(data.session.user._id)
                        }, {
                            $inc: {
                                wallet: Number(data.body.amounttoreturn)
                            }
                        });
                        await db.get().collection("wallet").insertOne({
                            user: ObjectId(data.session.user._id),
                            type: "credit",
                            amount: Number(data.body.amounttoreturn),
                            product: `cancellation of ${
                                data.body.name
                            }`,
                            date: new Date().toLocaleString()
                        });
                    }

                    await db.get().collection("Products").updateOne({
                        _id: ObjectId(data.body.model)
                    }, {
                        $inc: {
                            stock: parseInt(data.body.count)
                        }
                    })
                }

            } else { // res.send({cancelled: false});
                resolve({cancelled: false})
            }
        })
    },


    orderInfo:(data)=>{
        return new Promise(async(resolve,reject)=>{
            const order = await db.get().collection(collectionNames.ORDERS_COLLECTION).aggregate([
                {
                    $match: {
                        _id: ObjectId(data.params.id)
                    }
                }, {
                    $unwind: "$product"
                }, {
                    $lookup: {
                        from: "Products",
                        localField: "product.product",
                        foreignField: "_id",
                        as: "pp"
                    }
                },
            ]).toArray()
             resolve({order})
           
        
        })
    }

}
