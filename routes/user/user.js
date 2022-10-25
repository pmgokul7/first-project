const express=require("express")
const { ObjectId, ObjectID, Db } = require("mongodb")
const route=express.Router()
const con=require("../../config/connection")
const helper=require("../../helpers/buyProducts")

route.use(function (req,res,next) {
    if(req.session.user)
    {
        next()
    }
    else{
        // res.redirect("/login")
        next()
    }
})
route.get("/",(req,res)=>{
    res.render("user/userHome",{result:req.session.user})
})


route.get("/products",(req,res)=>{
    res.render("user/products")
})

route.get("/products/info",(req,res)=>{
    helper.info(req).then((result)=>{
         res.render("user/info",{result:result.result})
    })

        // let text1="add to cart"
        
        // con.get().collection("Products").findOne({_id:new ObjectId(req.query.id)}).then((result)=>{
        //     con.get().collection("cart").findOne({$and:[{product:new ObjectId(req.query.id)},{user:req.session.user._id}]}).then((ifres)=>{
        //         if(ifres)
        //         {
        //         res.render("user/info",{result,text1})  
        //         }
        //         else{
        //             res.render("user/info",{result})   
        //         }
        //     })
        
        
        // })

    
})



route.post("/products",(req,res)=>{
    con.get().collection("Products").find({model:{$regex:req.body.search,$options:"i" }}).toArray().then((result)=>{
        searcsh=req.body.search
        res.render("user/products",{result,searcsh})
    })
    
})


route.get("/cart",(req,res)=>{
    let itemr=req.flash('info')
    console.log(req.session);
    con.get().collection("cart").aggregate([{$match:{user:req.session.user._id}},{$lookup:{
        from:"Products",
        localField:"product",
        foreignField:"_id",
        as:"p"  
    }}]).toArray().then(result=>{
        console.log(result);
        res.render("user/cart",{result,itemr})
    })
    
})
route.get("/products/addcart/:id",(req,res)=>{
    con.get().collection("cart").insertOne({user:req.session.user._id,product:new ObjectId(req.params.id),quantity:1}).then(()=>{
        console.log("item added to cart");
        res.redirect("/home/cart")
    })
})
route.post("/cart/remove",(req,res)=>{
    con.get().collection("cart").deleteOne({$and:[{product:new ObjectId(req.query.id)},{user:req.session.user._id}]}).then(()=>{
        console.log("item deleted from cart");
        req.flash('info','ha')
        // res.redirect("/home/cart")
    })
    console.log(req.query);
 })

 route.get("/info/remove",(req,res)=>{
    con.get().collection("cart").deleteOne({$and:[{product:new ObjectId(req.query.id)},{user:req.session.user._id}]}).then(()=>{
        console.log("item deleted from cart");
        req.flash('info','ha')
        res.redirect("/home/products/info")
    })
 })

 


//orders

// route.get("/orders",(req,res)=>{
//     con.get().collection("orders").aggregate([{$match:{user:ObjectId(req.session.user._id)}},{$unwind:"$products"},{$lookup:{

//         from:"Products",
//         localField:"products.item",
//         foreignField:"_id",
//         as:"p"  
//     }}]).toArray().then((result)=>{
//         res.render("user/orders",{result})
//         // console.log(result[0].p[0].images[0]);
//     })
//     // res.render("user/orders")
// })

route.get("/orders",(req,res)=>{
//   con.get().collection("orders").aggregate([{$match:{user:req.session.user.name}},{$lookup:{

//     from:"Products",
//     localField:"product",
//     foreignField:"_id",
//     as:"p"
//   }},{$sort:{time:-1}}]).toArray().then((result)=>{
//         console.log(result);
//         res.render("user/orders",{result})
//     })
helper.myOrders(req).then((result)=>{
   res.render("user/orders",{result})
})

})

route.get("/checkout/:id",(req,res)=>{
    con.get().collection("Products").findOne({_id:new ObjectId(req.params.id)}).then((result)=>{
       con.get().collection("user").findOne({_id:new ObjectId(req.session.user._id)}).then((user)=>{
        res.render("user/buynow",{result,user})
       })

        
    })
    
})


route.post("/addaddress/:id",(req,res)=>{
    console.log(req.body);
    con.get().collection("user").updateOne({_id:new ObjectId(req.session.user._id)},{$addToSet:{address:req.body}}).then((s)=>{
        res.send({add:true})
    })
})
route.post("/orderconfirm",(req,res)=>{
    console.log(req.body);
    con.get().collection("orders").insertOne({product:new ObjectId(req.body.productid),user:(req.session.user.name),method:"COD",status:"placed",address:req.body.address,time:req.body.date,quantity:req.body.quantity}).then((resu)=>{
        console.log("order placed");
    })

        
    })

    route.post("/orders/cancelorder",(req,res)=>{
        
        // console.log(req.query.id);
        con.get().collection("orders").updateOne({_id:new ObjectId(req.query.id)},{$set:{status:"canceled"}}).then(()=>{
            res.send({daleted:true})
            console.log("order deleted");
        })
    })

module.exports=route