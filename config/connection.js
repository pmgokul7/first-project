const mongo=require("mongodb").MongoClient
uri="mongodb://localhost:27017"
const paypal=require("paypal-rest-sdk")
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
    payPalConfig:()=>{
        paypal.configure({
            mode: "sandbox", // sandbox or live
            client_id: "ASRe872F9Xekn-YKrsWB65y1Y1OirSehIBbNFus5fIkbxrGwWuB2RGB6PAsqjrtXYyduNrH_UHRNaleD",
            client_secret: "EI0jsPvICu1X9i4_M65S7KYSqy1Y8EdPngbr6rUUI3Qpcsohp5f9dHJRiuuNhMt_USFXUfgmxqeYIH2z"
        });
    }
   
      
}
