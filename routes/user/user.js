const { Router } = require("express")
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
        res.redirect("/login")
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
         res.render("user/info",{result:result.result,cart:result.ifres,user:req.session.user})
    })

    

    
})



route.post("/products",(req,res)=>{
    con.get().collection("Products").find({model:{$regex:req.body.search,$options:"i" }}).toArray().then((result)=>{
        searcsh=req.body.search
        res.render("user/products",{result,searcsh,user:req.session.user})
    })
    
})


route.get("/cart",(req,res)=>{
//    console.log(req.session.user);

    
con.get().collection("cart").findOne({user:new ObjectId(req.session.user._id)}).then(results=>{
    if(results)
    {
        console.log("cart detected" , req.session.user.name);
        con.get().collection("cart").aggregate([{$match:{user:new ObjectId(req.session.user._id)}},{$unwind:"$products"},{$lookup:{from:"Products",
localField:"products.product",
foreignField:"_id", 
as:"p"
}}])
.toArray().then((result)=>{
    if(result)
    {
       console.log(result[0].p);
    res.render("user/cart",{result})  
    }
    else{
        console.log("cart is empty");
    }
   
    })
    }
    else{
    //    console.log("user not found in cart");
       con.get().collection("cart").insertOne({user:new ObjectId(req.session.user._id),products:[],count:0}).then(()=>{
        console.log("done");
       })
    }
})


})
// route.get("/products/addcart/:id",(req,res)=>{
//     con.get().collection("cart").findOne({$and:[{user:req.session.user._id},{product:new ObjectId(req.params.id)}]}).then((searchresult)=>{

//         if(searchresult)
//         {
//             console.log("item already in cart");
//             // res.redirect(`/home/products/info?id=${req.params.id}`)
//             res.send({already:true})
//         }
//         else{
//             con.get().collection("cart").insertOne({user:req.session.user._id,product:new ObjectId(req.params.id),quantity:1}).then(()=>{
//                 console.log("item added to cart");
//                 res.redirect("/home/cart")
//             })
//         }
//     })
   
// })

route.post("/cart/remove",(req,res)=>{
    con.get().collection("cart").updateOne({user:new ObjectId(req.session.user._id)},{$pull:{"products":{product:new ObjectId(req.query.id)}}}).then(()=>{
        console.log("item deleted from cart");
        req.flash('info','ha')
        // res.redirect("/home/cart")
    })
    console.log(req.query);
 })

 route.get("/info/remove",(req,res)=>{
    con.get().collection("cart").deleteOne({$and:[{user:new ObjectId(req.session.user._id)}]},{$pull:{products:{product:new ObjectId(req.query.id)}}}).then(()=>{
        console.log("item deleted from cart");
        req.flash('info','ha')
        res.redirect("/home/products/info")
    })
 })

 



route.get("/orders",(req,res)=>{
helper.myOrders(req).then((result)=>{
   res.render("user/orders",{result})
})

})

route.get("/checkout/:id",(req,res)=>{
  
   helper.checkout(req).then(result=>{
    res.render("user/buynow",{result:result.result,user:result.user})
   })
    
})


route.post("/addaddress/:id",(req,res)=>{
    helper.addressAdd(req).then((result)=>{
      res.send(result)
      console.log("added address");
    })
})
route.post("/orderconfirm",(req,res)=>{
    // console.log(req.body);
    helper.confirmCODOrder(req).then(result=>{
        // console.log("placed");
        res.send(result)
    })
        
    })

    route.post("/orders/cancelorder",(req,res)=>{
        helper.orderCancel(req).then((result)=>{
            res.send(result)
        })
    })

    route.post("/info/removefromcart",(req,res)=>{
        // con.get().collection("cart").deleteOne({$and:[{user:req.session.user._id},{product:new ObjectId(req.body.id)}]})
        con.get().collection("cart").updateOne({user:new ObjectId(req.session.user._id)},{$pull:{"products":{product:new ObjectId(req.body.id)}}}).then((result)=>{
             res.send({removedfromcart:true})
        })

        
    })
    route.post("/info/addtocart",(req,res)=>{
        con.get().collection("cart").findOne({user:new ObjectId(req.session.user._id)}).then((already)=>{
         if(already){
            con.get().collection('cart').updateOne({user:new ObjectId(req.session.user._id)},{$addToSet:{products:{product:new ObjectId(req.body.id),count:parseInt(1)}}}).then(()=>{
                res.send({added:true})
            })
         }
        })
    })


  route.get("/cart/checkout",(req,res)=>{
    // con.get().collection("user").findOne({_id:new ObjectId(req.session.user._id)}).then((user)=>{
        con.get().collection("cart").aggregate([{$match:{$and:[{user:new ObjectId(req.session.user._id)}]}},{$unwind:"$products"},{$lookup:{
            from:"Products",
            localField:"products.product",
            foreignField:"_id", 
            as:"p"
        
    }}]).toArray().then((result)=>{

    res.render("user/buynow2",{result,user:req.session.user}) 
    // console.log(result[0].p);
    })
    // })


    
   
  })

route.post("/cart/quantityupdate",(req,res)=>{
    // console.log(req.body);
    con.get().collection("user").findOne({_id:new ObjectId(req.session.user._id)}).then((user)=>{
        con.get().collection("cart").aggregate([{$match:{$and:[{user:req.session.user._id}]}},{$lookup:{
            from:"Products",
            localField:"products",
            foreignField:"_id", 
            as:"p" 
                    
                }}]).toArray().then(result=>{

                    
                        res.send({result})
                    
   

                })
    })
})



route.post("/quantityup",(req,res)=>{
    con.get().collection("cart").findOne({user:new ObjectId(req.session.user._id)}).then((result)=>{
        if(result){
            con.get().collection("cart").updateOne({user:new ObjectId(req.session.user._id),"products.product":new ObjectId(req.body.id)},{$set:{"products.count":10}})
        }
    })
})

module.exports=route