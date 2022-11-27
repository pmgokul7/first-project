const db=require("../config/connection")
const collectionNames=require("../config/collectionNames")
module.exports={
    getHome:(data)=>{
        return new Promise(async(resolve,reject)=>{
            try{
            if (data.session.user) {
                var result=await db.get().collection(collectionNames.PRODUCT_COLLECTION).aggregate([{$match:{isDeleted:false}}])
                resolve(result)
            } else {
                var result=await db.get().collection(collectionNames.PRODUCT_COLLECTION).aggregate([{$match:{isDeleted:false}}])
                resolve(result)
                
             
            }
        }  
        catch(err){
            console.log(err);
        }
        })
    },
    feedbackHelper:(data)=>{
        return new Promise(async(resolve,reject)=>{
            try{
           await db.get().collection("feedbacks").insertOne(data.body)
           resolve(true)
           console.log("feedback saved");
            }catch(err){
                console.log("error occured");
            }
        })
    }
}