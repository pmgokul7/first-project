const db = require("../config/connection");
const {ObjectId} = require("mongodb");
const collectionNames = require("../config/collectionNames")

module.exports = {
    editAddress: (data) => {
        return new Promise(async (resolve, reject) => {
            var add = await db.get().collection(collectionNames.USER_COLLECTION).findOne({
                _id: ObjectId(data.session.user._id)
            })
            var address = add.address[data.query.i];
            resolve({address})


        })
    },
    myAddress: (data) => {
        return new Promise(async (resolve, reject) => {
            var user = await db.get().collection(collectionNames.USER_COLLECTION).findOne({
                _id: ObjectId(data.session.user._id)
            })
            resolve({user})
        })
    },
    deleteAddress: (data) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collectionNames.USER_COLLECTION).updateOne({
                _id: ObjectId(data.session.user._id)
            }, [{
                    $set: {
                        address: {
                            $concatArrays: [
                                {
                                    $slice: [
                                        "$address", parseInt(data.query. in)
                                    ]
                                }, {
                                    $slice: [
                                        "$address", {
                                            $add: [
                                                1, parseInt(data.query. in)
                                            ]
                                        }, {
                                            $size: "$address"
                                        },
                                    ]
                                },
                            ]
                        }
                    }
                },])
        })
    }
}