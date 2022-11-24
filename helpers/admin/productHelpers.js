const db = require("../../config/connection");
const {ObjectId} = require("mongodb");
const collectionNames = require("../../config/collectionNames")
const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
    destination: "../../public/uploads",
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
});

module.exports={
    upload:multer({storage: storage}),
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
           const products=await db
            .get()
            .collection(collectionNames.PRODUCT_COLLECTION)
            .find({isDeleted:false})
            .toArray()
            resolve(products)
            
        })
    },
    deleteProduct:(data)=>{
        return new Promise((resolve, reject) => {
            db.get()
              .collection("Products")
              .updateOne({ _id:  ObjectId(data.query.id) },{$set:{isDeleted:true}})
              .then(() => {
                resolve({ productDeleted: true });
              });
          });
    },
    addProducts:(data)=>{
        return new Promise(async(resolve,reject)=>{
            console.log(data.files);
            console.log(data.files.length);
            const response = await db.get().collection("Products").insertOne({
                model: data.body.model,
                brand: data.body.brand,
                ROM: data.body.ROM,
                RAM: data.body.RAM,
                category: data.body.category,
                stock: parseInt(data.body.stock),
                price: parseInt(data.body.price),
                offerprice: parseInt(data.body.price),
                rating: parseInt(data.body.rating),
                color: data.body.color,
                OS: data.body.OS,
                highlights: data.body.highlights,
                description: data.body.description,
                isDeleted: false,
                added: new Date()
        
            })
            console.log("details updated");
            globalid = response.insertedId;
              console.log("oops",data.files);
            // for ( i = 0; i < data.files.length; i++) {
                data.files.map(async (file) => {
                if (file.fieldname == "mainImage") {
                    var locaFilePath = file.path;
                    const r = await db.uploadToCloudinary(locaFilePath)
                    await db.get().collection("Products").updateOne({
                        _id: globalid
                    }, {
                        $set: {
                            mainImage: r.url
                        }
                    })
                    console.log("main pushed");
        
        
                } else if (file.fieldname == "image1") {
        
                    var locaFilePath = file.path;
                    const images = await db.uploadToCloudinary(locaFilePath)
                    await db.get().collection("Products").updateOne({
                        _id: globalid
                    }, {
                        $set: {
                            image1: images.url
                        }
                    })
                    // console.log(i, ":sub pushed");
                    console.log(images.url);
        
        
                }else if(file.fieldname == "image2") {
                    var locaFilePath = file.path;
                    const images = await db.uploadToCloudinary(locaFilePath)
                    await db.get().collection("Products").updateOne({
                        _id: globalid
                    }, {
                        $set: {
                            image2: images.url
                        }
                    })
                    // console.log(i, ":sub pushed");
                    console.log(images.url);
                }else if(file.fieldname == "image3") {
                    var locaFilePath = file.path;
                    const images = await db.uploadToCloudinary(locaFilePath)
                    await db.get().collection("Products").updateOne({
                        _id: globalid
                    }, {
                        $set: {
                            image3: images.url
                        }
                    })
                    // console.log(i, ":sub pushed");
                    console.log(images.url);
                }
            })
            resolve({insert:true})
        })
    }
}