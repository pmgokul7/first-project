const express=require("express")
const route=express.Router()
const helper=require("../../helpers/LoginHelpers")
const con=require("../../config/connection") 
const otpgen=require("otp-generators")
const { ObjectId } = require("mongodb")
const client=require("twilio")("AC310ba1f6e25df76fe77562d899355658","f181af19d88019bab6b437c2aaa7ef68")

route.get("/",(req,res)=>{
    if(req.session.user)
    {   
        res.redirect("/home")
    }
    else
    {
        var msg=req.flash('info')
        var msg2=req.flash('info2')
        res.render("user/userLogin",{msg,msg2})
    }
})


route.post("/",(req,res)=>{
    console.log(req.body);
    helper.userloginValidator(req.body).then(result=>{
        if(req.body.mobile=="" || req.body.password=="")
        {
           req.flash('info','please fill all the fields')
           res.redirect("/login")
        }
    else if(result.loginstatus==true)
     {
        console.log("logged in");
        req.session.user=result.result  
        req.session.userLogged=true
        con.get().collection("cart").findOne({user:new ObjectId(req.session.user._id)}).then((found)=>{
            if(!found)
            {
               con.get().collection("cart").insertOne({user:new ObjectId(req.session.user._id),products:[],count:0}).then(()=>{
            console.log("cart also created");
           }) 
            }
        })
        
        res.redirect("/home")
     }
     else if(result.loginstatus==false)
     {
        req.flash('info','invalid username or password')
        res.redirect("/login")
     }
     else if(userfound==false)
     {
        
        req.flash('info','no user found')
        res.redirect("/login")
     }
     else if(result.blocked==true)
     {
    
        req.flash('info','something went wrong')
        res.redirect("/login")
     }
   
    })
 })

 route.get("/otp-login",(req,res)=>{
    msg=req.flash('info')
    res.render("user/otpLogin",{msg})
 })


 route.post("/otp-login",(req,res)=>{
    con.get().collection("user").findOne({mobile:req.body.mobile}).then(result=>{
       
       if(req.body.mobile=="")
       {
        req.flash('info','please enter your mobile number')
        res.redirect("/login/otp-login")
       }
       else if(result.status==false)
       {    
        req.flash('info','user is blocked')
        res.redirect("/login/otp-login")
        console.log(result.status)
       }
        else if(result)
        {
            ress=result
            otp=otpgen.generate(4, { alphabets: false, upperCase: false, specialChar: false });

            client.messages.create({
                to:`+91${req.body.mobile}`,
                from:"+12055512021",
                body:`your otp is:${otp}`
            }).then(()=>{
                console.log(`otp send:${otp}`);
                res.render("user/otp-auth")
            }).catch((err)=>{
                console.log("twilio er",err);
            })
        }
        else{
            req.flash('info','user not found')
            res.redirect("/login/otp-login")

        }
    })
  
 })
 route.post("/otp-auth",(req,res)=>{
    if(req.body.mobile===otp)
    {
        req.session.user=ress
        res.redirect("/home")
    }
    else{
        req.flash('info','ivalid otp!retry')
        res.redirect("/otp-login")
    }
 })




module.exports=route