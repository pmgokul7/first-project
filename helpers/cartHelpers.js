const db = require("../config/connection");
const collections = require("../config/collectionNames")
const {ObjectId} = require("mongodb");
const collectionNames = require("../config/collectionNames")

module.exports = {
    removeFromCart: (data) => {
        console.log("called",data.body);
        return new Promise(async (resolve, reject) => {
           r= await db.get().collection(collectionNames.USER_CART).updateOne({
                user: ObjectId(data.session.user._id)
            }, {
                $pull: {
                    products: {
                        product: ObjectId(data.body.id)
                    }
                }
            })
            console.log(r);
            resolve({removedfromcart: true});

        });
    },

    removeFromCart2: (data) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collectionNames.USER_CART).updateOne({
                user: ObjectId(data.session.user._id)
            }, {
                $pull: {
                    products: {
                        product: ObjectId(data.query.id)
                    }
                }
            })
            resolve({deleted: true});
        });
    },


    addToCart: (data) => {
        return new Promise(async (resolve, reject) => {
            const userFound = await db.get().collection(collections.USER_CART).findOne({
                user: ObjectId(data.session.user._id)
            })
            if (userFound) {
                await db.get().collection(collections.USER_CART).updateOne({
                    user: ObjectId(data.session.user._id)
                }, {
                    $addToSet: {
                        products: {
                            product: ObjectId(data.body.id),
                            count: parseInt(1)
                        }
                    }
                })

                resolve({added: true});

            }

        });
    },

    getCartProducts: (data) => {

        return new Promise(async (resolve, reject) => {
            if(data.session.user){
                var cartItems = await db.get().collection(collectionNames.USER_CART).aggregate([

                    {
                        $match: {
                            user: ObjectId(data.session.user._id)
                        }
                    }, {
                        $unwind: '$products'
                    }, {
                        $lookup: {
                            from: "Products",
                            localField: "products.product",
                            foreignField: "_id",
                            as: "pro"
                        }
                    }, {
                        $project: {
                            "products.product": 1,
                            "products.count": 1,
                            pro: {
                                $arrayElemAt: ['$pro', 0]
                            }
    
    
                        }
                    }
                ]).toArray()
                resolve(cartItems)
                console.log("this");
            }else{
                resolve(null)
             console.log("that");
            }
           

            

        })
    },
    changeProQuantity: (data) => {
        console.log(data.body);
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collectionNames.USER_CART).updateOne({
                user: ObjectId(data.session.user._id),
                "products.product": ObjectId(data.body.product)
            }, {
                $inc: {
                    'products.$.count': parseInt(data.body.count)
                }
            }, {
                $set: {
                    'product.$.price': 45
                }
            })
            resolve({updated: true})

        })
    },

    cartCheckOut: (data) => {
        return new Promise(async (resolve, reject) => {
            var cartItems = await db.get().collection(collectionNames.USER_CART).aggregate([
                {
                    $match: {
                        user: ObjectId(data.session.user._id)
                    }
                },
                {
                    $unwind: "$products"
                },

                {
                    $lookup: {
                        from: "Products",
                        localField: "products.product",
                        foreignField: "_id",
                        as: "pro"
                    }
                },
                {
                    $project: {
                        "products.product": 1,
                        "products.count": 1,
                        pro: {
                            $arrayElemAt: ["$pro", 0]
                        }
                    }
                }, {
                    $group: {
                        _id: null,
                        total: {
                            $sum: {
                                $multiply: ["$products.count", "$pro.offerprice"]
                            }
                        }
                    }
                },
            ]).toArray()
            var result = await db.get().collection(collectionNames.USER_CART).aggregate([
                {
                    $match: {
                        $and: [
                            {
                                user: ObjectId(data.session.user._id)
                            }
                        ]
                    }
                }, {
                    $unwind: "$products"
                }, {
                    $lookup: {
                        from: "Products",
                        localField: "products.product",
                        foreignField: "_id",
                        as: "p"
                    }
                },
            ]).toArray()
            globalcartTotal = cartItems;
            cartProducts = result;
            var user = await db.get().collection(collectionNames.USER_COLLECTION).findOne({
                _id: ObjectId(data.session.user._id)
            })

            resolve({
                result,
                user,
                cartItems,
                cartProducts,
                globalcartTotal
            })


            console.log(data.session.user);


        })
    },

    getCartTotal:(data)=>{
        return new Promise(async(resolve,reject)=>{
            if(data.session.user){
                db.get().collection("cart").aggregate([
                    {
                        $match: {
                            user: ObjectId(data.session.user._id)
                        }
                    },
                    {
                        $unwind: "$products"
                    },
            
                    {
                        $lookup: {
                            from: "Products",
                            localField: "products.product",
                            foreignField: "_id",
                            as: "pro"
                        }
                    },
                    {
                        $project: {
                            "products.product": 1,
                            "products.count": 1,
                            pro: {
                                $arrayElemAt: ["$pro", 0]
                            }
                        }
                    }, {
                        $group: {
                            _id: null,
                            total: {
                                $sum: {
                                    $multiply: ["$products.count", "$pro.offerprice"]
                                }
                            }
                        }
                    },
                ]).toArray().then((total) => {
                    db.get().collection("cart").aggregate([
                        {
                            $match: {
                                user: ObjectId(data.session.user._id)
                            }
                        },
                        {
                            $unwind: "$products"
                        },
            
                        {
                            $lookup: {
                                from: "Products",
                                localField: "products.product",
                                foreignField: "_id",
                                as: "pro"
                            }
                        },
                        {
                            $project: {
                                "products.product": 1,
                                "products.count": 1,
                                pro: {
                                    $arrayElemAt: ["$pro", 0]
                                }
                            }
                        }, {
                            $project: {
                                total: {
                                    $sum: {
                                        $multiply: ["$products.count", "$pro.offerprice"]
                                    }
                                }
                            }
                        },
                    ]).toArray().then((eachsum) => {
                        cartTotal = total;
                        console.log("this is total",total);
                        // res.send(total);
                        resolve({total})
                        console.log(eachsum);
                    });
                });
            }
                // resolve({status:false})
            
        
        })
    }

};
