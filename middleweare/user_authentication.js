const User=require('../models/userModel')


// const isLogin = async(req,res,next)=>{
//     try {
//        if(req.session.user_id){
//           next()
//        }
//        else{
//           res.redirect('/');
//        }
//     } catch (error) {
//        console.log(error.message)
//     }
//  }
const isLogin=async(req,res,next)=>{
   
   if(req.session.user){
     const userId=req.session.user
      User.findById(userId)
       .then((data)=>{
        
           if(data.isBlocked==false){
            res.redirect('/home')
           }else{
               res.redirect('/Login')
           }
       })
   }else{
      next()
   }
}

const isLogged=((req,res,next)=>{
   
   if(req.session.user){
     
     User.findById({_id:req.session.user}).lean()
       .then((data)=>{
        
           if(data.isBlocked==false){
             next()
           }else{
               res.redirect('/Login')
           }
       })
   }else{
       res.redirect('/')
   }
})
const isBlockBfr=async(req,res,next)=>{
   
   if(req.session.user){
     const userId=req.session.user
       User.findById(userId)
       .then((data)=>{
        
           if(data.isBlocked==false){
            next()
           }else{
               res.redirect('/Login')
           }
       })
   }else{
      next()
   }
}


 
 const isLogout = async(req,res,next)=>{
    try {
       if(req.session.user){
          res.redirect('/home');
       }else{
          next();
       }
       
    } catch (error) {
       console.log(error.message)
    }
 }
 
 module.exports = {
    isLogin,
    isLogout,
    isBlockBfr,
    isLogged
 }
