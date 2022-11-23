const db = require("../config/connection");
const {ObjectId} = require("mongodb");
const collectionNames = require("../config/collectionNames")


module.exports = {
    addToWishHelper: (data) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collectionNames.WISHLIST_COLLECTION).updateOne({
                user: ObjectId(data.session.user._id)
            }, {
                $push: {
                    products: {
                        product: ObjectId(data.body.pid)
                    }
                }
            })
            resolve({added: true})

        })
    },
    removeFromWishHelper: (data) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collectionNames.WISHLIST_COLLECTION).updateOne({
                user: ObjectId(data.session.user._id)
            }, {
                $pull: {
                    products: {
                        product: ObjectId(data.body.pid)
                    }
                }
            })
            resolve({removed: true})


        })
    },

    getWishListHelper: (data) => {
        return new Promise(async (resolve, reject) => {
            var wish = await db.get().collection(collectionNames.WISHLIST_COLLECTION).findOne({
                user: ObjectId(data.session.user._id)
            })
            if (wish) {
                var r = await db.get().collection(collectionNames.WISHLIST_COLLECTION).aggregate([
                    {
                        $match: {
                            user: ObjectId(data.session.user._id)
                        }
                    }, {
                        $lookup: {
                            from: "Products",
                            localField: "products.product",
                            foreignField: "_id",
                            as: "p"
                        }
                    },
                ]).toArray()

                resolve({r})
                console.log("this is wishlist", r);


            } else {
                var r = await db.get().collection(collectionNames.WISHLIST_COLLECTION).insertOne({

                    user: ObjectId(data.session.user._id),
                    products: []
                })
                resolve({r})

            }


        })
    }
}
