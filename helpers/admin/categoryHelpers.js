const db = require("../../config/connection");
const {ObjectId} = require("mongodb");
const collectionNames = require("../../config/collectionNames");
module.exports = {
    addCategory: (data) => {
        return new Promise(async (resolve, reject) => {
            const category = await db.get().collection("cat").findOne({name: data.body.newcat.toUpperCase()})

            console.log(category);
            if (category) {
                resolve({alreadyExist: true})
            } else if (data.body.newcat == "") {
                resolve({empty: true})

            } else {
                await db.get().collection("cat").insertOne({name: data.body.newcat.toUpperCase(), offer: 0})
                resolve({inserted: true})


            }

        })
    },
    editCategory: (data) => {
        return new Promise(async (resolve, reject) => {
            if (data.body.newcat == "") {
                resolve({empty: true})
                
            } else {
                await db.get().collection("cat").updateOne({
                    _id: ObjectId(data.query.id)
                }, {
                    $set: {
                        name: data.body.newcat
                    }
                })
                resolve({updated: true})

            }
        })
    }
}

