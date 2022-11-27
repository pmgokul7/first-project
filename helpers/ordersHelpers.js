const db = require("../config/connection");
const {ObjectId} = require("mongodb");
const collectionNames = require("../config/collectionNames");


module.exports = {
    userOrders: (data) => {
        return new Promise(async (resolve, reject) => {
            try{
            var result = await db.get().collection(collectionNames.ORDERS_COLLECTION).aggregate([
                {
                    $match: {
                        user: data.session.user.name,
                        paymentstatus: "success"
                    }
                },
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

        }catch(err){
         if(err){
            reject({err})
         }
        }
        })
    },
    returnProducts: (data) => {
        return new Promise(async (resolve, reject) => {
            // console.log("kjghjhgfghjkl;",data.body.amounttoreturn);
            try{
                console.log("this is body cancel:",data.body);
                if (data.body.discount == "") {
                        disc = 0;
                    } else {
                        disc = data.body.discount;
                    }
                   
                        discountAmount=data.body.returnAmount*disc/100
                
                var currentUser=await db.get().collection(collectionNames.USER_COLLECTION).findOne({_id:ObjectId(data.session.user._id)})
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
                     
                           var currentUser =await db.get().collection("user").updateOne({
                                _id: ObjectId(data.session.user._id)
                            }, {
                                $set: {
                                    wallet:parseInt(currentUser.wallet)+ Math.ceil(Number(data.body.priceAndCount-(data.body.returnAmount*disc)/100))
                                }
                            });
                            await db.get().collection("wallet").insertOne({
                                user: ObjectId(data.session.user._id),
                                type: "credit",
                                amount: Math.ceil(Number(data.body.priceAndCount-(data.body.returnAmount*disc)/100)),
                                product: `cancellation of ${
                                    data.body.name
                                }`,
                                date: new Date().toLocaleString()
                            });
                            console.log("wallet history updated:",Math.ceil(Number(data.body.priceAndCount-(data.body.returnAmount*disc)/100)));
                           
                            // console.log("returned to wallet:",data.body.returnAmount);
                        
    
                        await db.get().collection("Products").updateOne({
                            _id: ObjectId(data.body.model)
                        }, {
                            $inc: {
                                stock: parseInt(data.body.count)
                            }
                        })
                        console.log("stock updated after cancellation:",data.body.count);
                    }
    
                } 
            }catch(err){
                console.log(err);
            }
            // console.log("return amount added",Number(order.walletAmount) + Number(data.body.returnAmount));
            resolve({return: true})
        })

    },
    cancelOrders: (data) => {
        return new Promise(async (resolve, reject) => {
            try{
            console.log("this is body cancel:",data.body);
            if (data.body.discount == "") {
                    disc = 0;
                } else {
                    disc = data.body.discount;
                }
               
                    discountAmount=data.body.returnAmount*disc/100
            
            var currentUser=await db.get().collection(collectionNames.USER_COLLECTION).findOne({_id:ObjectId(data.session.user._id)})
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
                    if (data.body.method != "COD") {
                       var currentUser =await db.get().collection("user").updateOne({
                            _id: ObjectId(data.session.user._id)
                        }, {
                            $set: {
                                wallet:parseInt(currentUser.wallet)+ Math.ceil(Number(data.body.priceAndCount-(data.body.returnAmount*disc)/100))
                            }
                        });
                        await db.get().collection("wallet").insertOne({
                            user: ObjectId(data.session.user._id),
                            type: "credit",
                            amount: Math.ceil(Number(data.body.priceAndCount-(data.body.returnAmount*disc)/100)),
                            product: `cancellation of ${
                                data.body.name
                            }`,
                            date: new Date().toLocaleString()
                        });
                        console.log("wallet history updated:",Math.ceil(Number(data.body.priceAndCount-(data.body.returnAmount*disc)/100)));
                       
                        // console.log("returned to wallet:",data.body.returnAmount);
                    }

                    await db.get().collection("Products").updateOne({
                        _id: ObjectId(data.body.model)
                    }, {
                        $inc: {
                            stock: parseInt(data.body.count)
                        }
                    })
                    console.log("stock updated after cancellation:",data.body.count);
                }

            } 
        }catch(err){
            console.log(err);
        }
        })
    },


    orderInfo:(data)=>{
        return new Promise(async(resolve,reject)=>{
            try{
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
        }catch(err){
            reject(err)
        }
        
        })
    }

}
