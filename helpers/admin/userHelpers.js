const db = require("../../config/connection");
const {ObjectId} = require("mongodb");
const collectionNames = require("../../config/collectionNames");
const { ModelBuildPage } = require("twilio/lib/rest/autopilot/v1/assistant/modelBuild");

module.exports={
    getAllUsers:(data)=>{
        return new Promise((resolve,reject)=>{
            const page = data.query.p || 0;
            const dataperpage = 10;
            db
              .get()
              .collection(collectionNames.USER_COLLECTION)
              .aggregate([
                { $match: {} },
                { $skip: page * dataperpage },
                { $limit: dataperpage },
              ])
              .toArray()
              .then((users) => {
                db
                  .get()
                  .collection("user")
                  .countDocuments((count) => {
                    resolve({ users, count })
                    
                  });
              });
        })
    },
    userDelete:(data)=>{
        return new Promise(async(resolve,reject)=>{

         await db
        .get()
        .collection("user")
        .deleteOne({ _id: ObjectId(data.query.id) })
        resolve({delete:true})  
        })
        
    }
}