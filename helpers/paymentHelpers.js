const db = require("../config/connection");
const {ObjectId} = require("mongodb");
const collectionNames = require("../config/collectionNames")
const moment = require("moment")
const paypal = require("paypal-rest-sdk");
const crypto = require("crypto");
const Razorpay = require("razorpay");



instance = new Razorpay({key_id: "rzp_test_kwZGFuI0hWeY2V", key_secret: "b4PuKMMLTh2w0HRjNrKe36Ax"});

module.exports = {
    
    paymentHelper: (data) => {
        return new Promise(async (resolve, reject) => {
            
                discount=cartTotal[0].total * data.body.discount/100
            
            var user = await db.get().collection(collectionNames.USER_COLLECTION).findOne({
                _id: ObjectId(data.session.user._id)
            });
            walletbalanc = user.wallet;
            if (data.body.useWalletonline == "true") {
                walletbalanc = walletbalanc;
            } else {
                walletbalanc = 0;
            }
            address = JSON.parse(data.body.address);
            total = cartTotal[0].total -discount
            if (data.body.payment == "paypal") {
                console.log("bodyy:", data.body);
                console.log("this is carttotal", cartTotal[0].total);

                console.log("you chose paypal");
                var create_payment_json = {
                    intent: "sale",
                    payer: {
                        payment_method: "paypal"
                    },
                    redirect_urls: {
                        return_url: "https://steller.in.net/cartsuccess",
                        cancel_url: "https://steller.in.net/home/failed"
                    },
                    transactions: [
                        {
                            amount: {
                                currency: "USD",
                                total: Math.ceil(total - walletbalanc < 0 ? 0 : total - walletbalanc)
                            },
                            description: "This is the payment description."
                        },
                    ]
                };
                paypal.payment.create(create_payment_json, async function (error, payment) {
                    if (error) {
                        throw error;
                    } else {
                        console.log(payment);
                        for (let i = 0; i < payment.links.length; i++) {
                            if (payment.links[i].rel === "approval_url") {
                                resolve({paypal: payment.links[i].href});
                            }
                        }
                        re = await db.get().collection(collectionNames.USER_CART).findOne({
                            user: ObjectId(data.session.user._id)
                        })
                        products = re.products;
                        console.log(products);
                      
                        
                          var discountAmount=(cartTotal[0].total * data.body.discount) / 100;
                        
                        r = await db.get().collection(collectionNames.ORDERS_COLLECTION).insertOne({
                            product: products,
                            user: data.session.user.name,
                            method: "paypal",
                            status: "pending",
                            paymentstatus: "pending",
                            walletAmount: total -(total - walletbalanc < 0 ? 0 : total - walletbalanc),
                            address: JSON.parse(data.body.address),
                            time: moment().format("L"),
                            date: moment().toDate(),
                            coupon: data.body.ID,
                            discount: data.body.discount,
                            discountAmount:discountAmount,
                            total: total - walletbalanc < 0 ? 0 : total - walletbalanc
                        })
                        cartpaypalid = r.insertedId;
                        await db.get().collection(collectionNames.ORDERS_COLLECTION).updateOne({
                            _id: cartpaypalid
                        }, {
                            $set: {
                                status: "pending",
                                paymentstatus: "pending",
                                "product.$[].status": "pending"
                            }
                        })
                        console.log("products inserted after paypal bu pending");
                        console.log(r.insertedId);


                        // items=[]
                    }
                });
            } else if (data.body.payment == "razorpay") {
                console.log("you chose razorpay");
                address=data.body.address
                coupon=data.body.ID
                discount= data.body.discount;
              
                
                


                var options = {
                    amount: Math.ceil(total - walletbalanc < 0 ? 0 : total - walletbalanc) * 100, // amount in the smallest currency unit
                    currency: "INR",
                    receipt: "order_rcptid_11"
                };
                instance.orders.create(options, function (err, order) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(order);
                        resolve({razor: order});
                    }
                });
            }

        })
    },
    paymentFailed:(data)=>{
        return new Promise(async(resolve,reject)=>{
            
            cartpaypalid = r.insertedId;
            await db.get().collection(collectionNames.ORDERS_COLLECTION).updateOne({
                _id: cartpaypalid
            }, {
                $set: {
                    status: "failed",
                    paymentstatus: "failed",
                    "product.$[].status": "failed"
                }
            })
            resolve({status:true})  
                   
              
            
        })
    },
    


    razorpayVarify:(data)=>{
        return new Promise(async(resolve,reject)=>{
            let hmac = crypto.createHmac("sha256", "b4PuKMMLTh2w0HRjNrKe36Ax");
            hmac.update(data.body["payment[razorpay_order_id]"] + "|" + data.body["payment[razorpay_payment_id]"]);
            hmac = hmac.digest("hex");
            if (hmac == data.body["payment[razorpay_signature]"]) {
                console.log("payment is success");
                var discountAmount=(cartTotal[0].total * data.body.discount) / 100;
            
                items2 = [];
                re = await db.get().collection(collectionNames.USER_CART).findOne({
                    user: ObjectId(data.session.user._id)
                })
                products = re.products;
                r = await db.get().collection(collectionNames.ORDERS_COLLECTION).insertOne({
                    product: products,
                    user: data.session.user.name,
                    method: "razorpay",
                    status: "pending",
                    paymentstatus: "pending",
                    walletAmount: total -(total - walletbalanc < 0 ? 0 : total - walletbalanc),
                    address: JSON.parse(address),
                    time: moment().format("L"),
                    date: moment().toDate(),
                    coupon:coupon,
                    discount: discount,
                    discountAmount:discountAmount,
                    total: Math.ceil(total - walletbalanc < 0 ? 0 : total - walletbalanc)
                })
             
                razorid=r.insertedId
                console.log("kjhgfdfghjkl;", razorid);
               
               e=await db.get().collection(collectionNames.ORDERS_COLLECTION).updateOne({
                    _id: razorid
                }, {
                    $set: {
                        status: "placed",
                        paymentstatus: "success",
                        "product.$[].status": "placed"
                    }
                })
           
        
                    products.map((prod) => {
                        db.get().collection(collectionNames.PRODUCT_COLLECTION).updateOne({
                            _id: ObjectId(prod.product)
                        }, {
                            $inc: {
                                stock: -prod.count
                            }
                        }).then(() => {
                        });
                    });
              
        
               r=await db.get().collection("cart").updateOne({
                    user: ObjectId(data.session.user._id)
                }, {
                    $set: {
                        products: []
                    }
                })
                   await db.get().collection(collectionNames.USER_COLLECTION).updateOne({
                        _id: ObjectId(data.session.user._id)
                    }, {
                        $inc: {
                            wallet: -(total -(total - walletbalanc < 0 ? 0 : total - walletbalanc))
                        }
                    })
                    
               
                // res.render("user/success");
                resolve({status:true})
            } else{
        items2.map((s) => {
            db.get().collection(collectionNames.ORDERS_COLLECTION).updateOne({
                _id: s
            }, {
                $set: {
                    status: "failed payment",
                    paymentstatus: "failed"
                }
            }).then((d) => {
                
            });
        });
            }

        })
    },





    paypalPaymentsuccess:(data)=>{
        return new Promise(async(resolve,reject)=>{
      
           var result=await db.get().collection(collectionNames.ORDERS_COLLECTION).updateOne({
                _id: ObjectId(cartpaypalid)
            }, {
                $set: {
                    paymentstatus: "success",
                    status: "placed",
                    "product.$[].status": "placed"
                }
            })
                products.map((prod) => {
                    db.get().collection("Products").updateOne({
                        _id: ObjectId(prod.product)
                    }, {
                        $inc: {
                            stock: -prod.count
                        }
                    }).then(() => {
                        db.get().collection(collectionNames.USER_COLLECTION).updateOne({
                            _id: ObjectId(data.session.user._id)
                        }, {
                            $inc: {
                                wallet: -(total -(total - walletbalanc < 0 ? 0 : total - walletbalanc))
                            }
                        })
                    });
                });
                
           
        
                db.get().collection(collectionNames.USER_CART).updateOne({
                user: ObjectId(data.session.user._id)
            }, {
                $set: {
                    products: []
                }
            }).then((r) => {
                
                
                resolve({paypal:true})
            });
            
          })
    },





        
        
    COD:(data)=>{
            return new Promise(async(resolve,reject)=>{
                
               
                 var  discountAmount=(cartTotal[0].total * data.body.discount) / 100;
  
    var total = cartTotal[0].total -discountAmount;
    var user = await db.get().collection(collectionNames.USER_COLLECTION).findOne({
        _id: ObjectId(data.session.user._id)
    });

    var products = [];
    re=await db.get().collection(collectionNames.USER_CART).findOne({
        user: ObjectId(data.session.user._id)
    })
        var walletbalance = data.session.user.wallet;
        products = re.products;
        products.map((s) => {
            s.status = "placed";
        });
        if (data.body.usewallet2 == "true") {
            newwalletbalance = walletbalance;
        } else {
            newwalletbalance = 0;
        }
       
        inserted= await db.get().collection(collectionNames.ORDERS_COLLECTION).insertOne({
            product: products,
            user: data.session.user.name,
            method: data.body.usewallet2=="true" ? "CODW" : "COD",
            status: "placed",
            paymentstatus: "success",
            address: JSON.parse(data.body.address),
            time: moment().format("L"),
            date: moment().toDate(),
            coupon: data.body.ID,
            walletAmount: total - (total - newwalletbalance < 0 ? 0 : total - newwalletbalance),
            discount: data.body.discount,
            discountAmount:discountAmount,
            quantity: 1,
            total: total - newwalletbalance < 0 ? 0 : total - newwalletbalance
        })
            products.map((prod) => {
                db.get().collection(collectionNames.PRODUCT_COLLECTION).updateOne({
                    _id: ObjectId(prod.product)
                }, {
                    $inc: {
                        stock: -prod.count
                    }
                }).then(() => {
                });
            });
            insId = inserted.insertedId;
            db.get().collection("cart").updateOne({
                user: ObjectId(data.session.user._id)
            }, {
                $set: {
                    products: []
                }
            }).then(async () => {
                db.get().collection("coupons").findOne({ID: data.body.ID}).then(async (id) => {
                    if (id) {
                        db.get().collection("coupons").updateOne({
                            ID: data.body.ID
                        }, {
                            $push: {
                                users: data.session.user._id
                            },
                            $inc: {
                                count: -1
                            }
                        })
                    }
                    order = await db.get().collection("orders").findOne({_id: insId});
                    db.get().collection("user").updateOne({
                        _id: ObjectId(data.session.user._id)
                    }, {
                        $inc: {
                            wallet: -(total - order.total)
                        }
                    });
                    // db.get().collection("Products").updateOne()

                    // res.send({status: "success"});
                    resolve({status:"success"})
                });
            });
    
    
    console.log("this is cart products", cartProducts[0].p[0]);
    var sumCount = 0;
            })
          },

        payFromWallet:(data)=>{
            console.log("body",data.body);
            console.log("carttotal",cartTotal);
            discountAmount=(cartTotal[0].total * data.body.discount) / 100
            return new Promise(async(resolve,reject)=>{
                var total = cartTotal[0].total - discountAmount;
                var user = await db.get().collection(collectionNames.USER_COLLECTION).findOne({
                    _id: ObjectId(data.session.user._id)
                });
                var products = [];
                let re = await db.get().collection(collectionNames.USER_CART).findOne({
                    user: ObjectId(data.session.user._id)
                })
                console.log("current walletbalance is,", data.session.user.wallet);
                var walletbalance = data.session.user.wallet;
                products = re.products;
                products.map((s) => {
                    s.status = "placed";
                });
               
            
                inserted = await db.get().collection(collectionNames.ORDERS_COLLECTION).insertOne({
                    product: products,
                    user: data.session.user.name,
                    method: "wallet",
                    status: "placed",
                    paymentstatus: "success",
                    address: JSON.parse(data.body.address),
                    time: moment().format("L"),
                    date: moment().toDate(),
                    coupon: data.body.ID,
                    walletAmount: total,
                    discount: data.body.discount,
                    quantity: 1,
                    total: total+discountAmount
                })
                // db.get().collection(collectionNames.PRODUCT_COLLECTION).updateOne({
                //     _id: ObjectId(prod.product)
                // }, {
                //     $inc: {
                //         stock: -prod.count
                //     }
                // }).then(() => {
                //     console.log("wallet quantity changed");
                // });
                insId = inserted.insertedId;
                await db.get().collection(collectionNames.USER_CART).updateOne({
                    user: ObjectId(data.session.user._id)
                }, {
                    $set: {
                        products: []
                    }
                })
                var id = await db.get().collection(collectionNames.COUPON_COLLECTION).findOne({ID: data.body.ID})
                if (id) {
                    await db.get().collection(collectionNames.COUPON_COLLECTION).updateOne({
                        ID: data.body.ID
                    }, {
                        $push: {
                            users: data.session.user._id
                        },
                        $inc: {
                            count: -1
                        }
                    })
                    console.log("here user is pushed to the coupon");
            
                }
                order = await db.get().collection(collectionNames.ORDERS_COLLECTION).findOne({_id: insId});
                console.log("this is order");
                // console.log(total - order.total);
                await db.get().collection(collectionNames.USER_COLLECTION).updateOne({
                    _id: ObjectId(data.session.user._id)
                }, {
                    $inc: {
                        wallet: - total
                    }
                })
                await db.get().collection("wallet").insertOne({
                    user: ObjectId(data.session.user._id),
                    amount: total,
                    type: "debit",
                    date: new Date().toLocaleString()
                });
            
            
                console.log("cart is empty ");
                // res.send({status: "success"});
                resolve({status:"success"})
            
            
                console.log("this is cart products", cartProducts[0].p[0]);
                var sumCount = 0;
             

            })
          }
}
