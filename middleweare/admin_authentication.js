
// // const isLogin = async(req,res,next)=>{
// //    try {
// //       if(req.session.admin_id){
// //          next();
// //       }
// //       else{
// //          res.redirect('/admin');
// //       }
      
// //    } catch (error) {
// //       console.log(error.message)
// //    }
// // }

// const isLogin= async(req,res,next)=>{
//    try {
//    if(req.session.adminLoggedIn==true ){
//        next()
//    }else{
//        res.redirect('/admin')
//    }
// }catch (error) {
//        console.log(error.message)
//        }
//     }


const isLogout = async(req,res,next)=>{
   try {
      console.log('entered to isLogout');
      if(req.session.admin_id){
         res.redirect('/admin/home');
      }
      next();
   } catch (error) {
      console.log(error.message)
   }
}

// module.exports ={
//    isLogin,
//    isLogout
// }

const isAdminAuth=async(req,res,next)=>{
    try {
        if(req.session.admin_id){
            next()
        }else{
            res.redirect('/admin/loadLogin')
        }
        
    } catch (error) {
        console.log('error hapends in isAdminAuth middleware ',error);
    }
}


module.exports={isAdminAuth,
   isLogout}