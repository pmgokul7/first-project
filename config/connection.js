const mongo=require("mongodb").MongoClient
// uri="mongodb://localhost:27017"
const paypal=require("paypal-rest-sdk")
const Razorpay = require("razorpay");
const nodemailer=require("nodemailer")
const cloudinary = require("cloudinary").v2;
uri="mongodb+srv://pmgokul7:palappillil1234@steller.c6eyeri.mongodb.net/?retryWrites=true&w=majority"
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
            client_id: process.env.PAYPAL_CLIENT_ID,
            client_secret:process.env.PAYPAL_CLIENT_SECRET
        })
        console.log("paypal configured");
    },
 
         uploadToCloudinary:(locaFilePath)=> {
            var mainFolder = "main";
            var filePathOnCloudinary = mainFolder + "/" + locaFilePath;
            return cloudinary.uploader.upload(locaFilePath, {public_id: filePathOnCloudinary}).then((result) => {
                return {message: "done", url: result.url};
            });
        },
        razorpayConfig:()=>{
            instance = new Razorpay({key_id: "rzp_test_kwZGFuI0hWeY2V", key_secret: "b4PuKMMLTh2w0HRjNrKe36Ax"});

        },
        cloudinaryConfig:()=>{
            cloudinary.config({cloud_name: process.env.CLOUD_NAME, api_key: process.env.CLOUD_API_KEY, api_secret:process.env.CLOUD_API_SECRET});
            console.log("cloudinary configured");
        }
    ,
    mail:(data)=>{
        return new Promise((resolve,reject)=>{
            message = {
                from: data.email,
                to: "pmgokul7@gmail.com",
                subject: "Subject",
                text: `Name:${data.name}
                mobile:${data.Phone},
                message:${data.msg}`
                
           }
            var transport = nodemailer.createTransport({
                host: "smtp.mailtrap.io",
                port: 2525,
                auth: {
                  user: "9e55cf710de2fe",
                  pass: "01d0229603f1cb"
                }
              
              });
              transport.sendMail(message,function(err, info) {
                if (err) {
                  console.log(err)
                } else {
                  console.log(info);
                  resolve({status:true})
                }
            })

        })
       
    }
   
      
}
