const mongo=require("mongodb").MongoClient
uri="mongodb://localhost:27017"

// uri="mongodb+srv://pmgokul7:palappillil1234@steller.c6eyeri.mongodb.net/?retryWrites=true&w=majority"
dbname="stellar"

const state={
    db:null
}


module.exports={
    connect:()=>{
        mongo.connect(uri).then(connection=>{
          state.db=connection.db(dbname)
          console.log("connected to mongodb");
        }).catch((err)=>{
               console.log("errro");
        })
    },
    get:()=>{
        return state.db
    },
   
      
}
