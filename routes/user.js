const { response } = require('express');
var express = require('express');
const session = require('express-session');
const { resolve } = require('promise');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');
const verifyLogin = (req,res,next)=>{
  if(req.session.logIdn){
    next()
  }
  else{
    res.redirect("/login")
  }
}

/* GET home page. */
router.get('/',async function(req, res, next) {
  let user=req.session.user
  console.log(user);
  let cartCount=null
  if(req.session.user){
    cartCount= await userHelpers.getCartCount(req.session.user._id)
  } 
  
  productHelpers.getAllProducts().then((products)=>{
   
    
    res.render('partial/user/view-products',{products,user,cartCount})
  })
  
    
});
 router.get('/login',(req,res)=>{
  res.render('partial/user/login')
 if(req.session.logIdn){
  res.redirect("/")
 }else
 {
  res.render('partial/user/login',{"loginErr":req.session.loginErr})
  req.session.loginErr=false
  
 }
 
 })
 router.get('/singup',(req,res)=>{
  res.render('partial/user/singup')
 })
 router.post('/singup',(req,res)=>{
  userHelpers.doSingup(req.body).then((response)=>{
    console.log(response);
    req.session.logIdn=true
    req.session.user=response
    res.redirect('/')
  })
 })
 router.post("/login",(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.logIdn=true
      req.session.user=response.user
      res.redirect("/")
    }else{
      req.session.loginErr=true
      res.redirect("/login")
      
    }
  })
 })
 router.get("/logout",(req,res)=>{
  req.session.destroy()
  res.redirect("/")

 })
 router.get("/cart",verifyLogin,async(req,res)=>{
  let products=await userHelpers.getCartProducts(req.session.user._id)
  let cartTotal=0
  if(products.length>0){
    cartTotal=await userHelpers.getTotalAmount(req.session.user._id)
  }else{
    res.render('partial/user/cart-empty')
  }
   
  console.log(products)

  res.render("partial/user/cart",{products,user:req.session.user,cartTotal},)
  
 })
 router.get("/add-to-cart/:id",(req,res)=>{
  console.log("hello ")
  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
    
  res.json({status:true})
  })
 })
router.post('/change-product-quantity',(req,res,next)=>{
userHelpers.changeProductQuantity(req.body).then( async(response)=>{
  response.total=await userHelpers.getTotalAmount(req.body.user)
  res.json(response)
})
})
router.post('/remove-product',(req,res,next)=>{
 userHelpers.removeProduct(req.body).then((response)=>{
  res.json(true)
 })
})
router.get('/place-order', verifyLogin, async(req,res)=>{
  let total=await userHelpers.getTotalAmount(req.session.user._id)
  res.render("partial/user/place-order",{total,user:req.session.user})
})
router.post('/place-order',async(req,res)=>{
  let product=await userHelpers.getCartProductList(req.body.userId)
  let totalPrice=await userHelpers.getTotalAmount(req.body.userId)
  userHelpers.placeOrder(req.body,product,totalPrice).then((orderId)=>{
    if(req.body['payment-methode']=='COD'){
      res.json({codSuccess:true})
    }else{
      userHelpers.generateRazorpay(orderId,totalPrice).then((response)=>{

        res.json(response)

      })
    }
    
  
    
  })
 
  console.log(req.body)
})
router.get('/order',(req,res)=>{
  res.render('partial/user/order',{user:req.session.user})
})
router.get('/orders-det',async(req,res)=>{
  let orders=await userHelpers.getUsersOrder(req.session.user._id)
  res.render('partial/user/orders-det',{user:req.session.user,orders})
  console.log(orders)
  
})
router.get('/view-order/:id',async(req,res)=>{
  let products=await userHelpers.getOrderProducts(req.params.id)
  console.log("abcd",products)
  res.render('partial/user/view-order',{user:req.session.user,products})
  
})
router.post('/verify-payment',(req,res)=>{
  console.log(req.body)
  userHelpers.verifyPayment(req.body).then(()=>{
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      console.log('payment-success')
      res.json({status:true})
    })

  }).catch((err)=>{
    console.log('regregregreg',err)
    res.json({status:false,errMsg:'payment-filed'})
  })
})




module.exports = router;
