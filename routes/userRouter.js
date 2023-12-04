const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const nocache = require('nocache')
const logger = require('morgan')
const userRouter = express();

//----------multer setting---------------
const {
  upload
} = require('../multer/multer')
const uploadprd= require('../multer/multerproduct')
//---------------------------------------------------


const auth = require('../middleweare/user_authentication')
const userController = require('../controllers/userController');
const config = require('../config/config.js')
const {
  addToCart,
  displayCart,
  decrimentAjax,
  incrimentAjax,
  dltAllCrtItm,
  dltItem,
  updateCart,


} = require('../controllers/cartCtrl')

const {
  checkout,
  oderPlaced,
  allOderData,
  oderDetails,
  canselOder,
  verifyPayment,
  canselSingleOrder,
  salesReport,
  orderdtl,
  useWallet,
  returnOrder



} = require('../controllers/orderController')



const{
  invoice,
  invoiceDownload
}= require('../controllers/invoiceController')


const{
  validateCoupon
}= require('../controllers/couponController.js')

const{
  review
}= require('../controllers/reviewController.js')

const{
  displayWishlist,
    addToWishList,
    dltItemWshlst
}= require('../controllers/productController.js')

//--------walte ctrl-------
const {
  addMoneyWallet,
  updateMongoWallet,
  sumWallet,
  sumWalletBuynow
 

}=require('../controllers/walletController.js')

const{
  filterSearch,
    priceFilter,
    CatogaryFilter,
    clearFilter,
    sortByPrice
    
}= require('../controllers/filterCantroller')

userRouter.use(nocache());

userRouter.use(session({
  secret: config.sessionSecretId,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 }
}))

userRouter.use(bodyParser.json());
userRouter.use(bodyParser.urlencoded({ extended: true }));
userRouter.use(logger('dev'))
userRouter.set('view engine', 'ejs');
userRouter.set('views', './views/users');

// registration user

userRouter.get('/register', auth.isLogin, userController.loadRegister);
userRouter.post('/register', userController.insertUser);
userRouter.post('/verify', userController.verifyMail)

//veryfiying the otp

userRouter.post('/verifyOTP',userController.otpCheck)
userRouter.use(express.json())

// login user

userRouter.get('/Login', userController.loadLogin);

userRouter.get('/login', auth.isLogged, userController.loadLogin);
userRouter.post('/login', userController.verfiyUser);
userRouter.get('/user/aProducts', auth.isBlockBfr, upload.single('images'), userController.aProducts);
userRouter.get('/', auth.isBlockBfr, userController.loadHome);
userRouter.get('/home', auth.isBlockBfr, userController.loadHome);
userRouter.get('/logout', userController.userLogout);
userRouter.get('/Resendotp',userController.resendOtp)

userRouter.get('/otpPage',userController.otpPage)


// forgot passward--------------------
userRouter.get('/forgetPassward', userController.forgetPassward)
userRouter.post('/forgotPsdOTP', userController.verifyOTPFrgt)
userRouter.post('/forgotEmailValid', userController.forgotpaswrdEmailValidate)
userRouter.post('/updatePassword', userController.updatePassword)
userRouter.get('/changePassword', userController.getchangePassword)
userRouter.post('/change-password', userController.changePassword)
userRouter.get('/forgotpaswrdResend', userController.forgotpaswrdResend)


//expiry opt
userRouter.get('/expiryOTP',userController.expiryOTP)

userRouter.get('/expiryfrgtOTP',userController.expiryfrgtOTP)
//--------------------------------------

// userRouter.post('/send-otp',userController.sendOTP)
// userRouter.post('/verify-otp',userController.verifyOTP)
//---UserAbout Page--------------------------------
userRouter.get('/userAbout', auth.isLogged, userController.userAbout)

userRouter.get('/editProfile', auth.isLogged, userController.editProfile)
//--product---

userRouter.post('/updateUser', auth.isLogged, userController.updateUser)

//ad adress

userRouter.get('/addAddress', auth.isLogged, userController.addAddress)

userRouter.post('/addnewAddress', auth.isLogged, userController.addnewAddress)

userRouter.get('/editAddress', auth.isLogged, userController.loadEditAddress)

userRouter.post('/editAddress', auth.isLogged, userController.updateEditedAddress)

userRouter.get('/deleteAddress', auth.isLogged, userController.deleteAddress)


userRouter.get('/categoryBase',auth.isLogged, userController.categoryProduct)

userRouter.get('/addAddressCheck', auth.isLogged, userController.addAddresscheck)

userRouter.post('/addnewAddresscheck', auth.isLogged, userController.addnewAddresscheck)
//------cart-Management--------------------------------------------

// displaying Cart
userRouter.get('/displayCart', auth.isLogged, displayCart)

//incriment quantity of product in cart
userRouter.post('/incproduct', auth.isLogged, incrimentAjax)

//decriment quantity of product in cart
userRouter.post('/decproduct', auth.isLogged, decrimentAjax)

//Delete a single product in cart
userRouter.post('/dltItem', auth.isLogged, dltItem)

//Add product to Cart
userRouter.get('/addToCart', auth.isLogged, addToCart)

//Delete all product in cart
userRouter.get('/dltAllCrtItm', auth.isLogged, dltAllCrtItm)

//update cart
userRouter.post('/updateCart', auth.isLogged, updateCart)

//-------------------------------------------------------------------------


//------------invoice management-------------------------------
userRouter.get('/invoice',auth.isLogged,invoice)

userRouter.get('/download-Invoice',auth.isLogged,invoiceDownload)
//-------------------------------------------------------------
//--------------------------------------------------------

//USER Check Out
userRouter.get('/orderdtl',auth.isLogged,orderdtl)

userRouter.get('/checkOut', auth.isLogged, checkout)

userRouter.post('/verifyPayment', auth.isLogged, verifyPayment)
userRouter.post('/oderPlaced', oderPlaced)

userRouter.get('/allOderData', auth.isLogged, allOderData)


userRouter.get('/oderDetails', auth.isLogged, oderDetails)

userRouter.get('/canselOrder', auth.isLogged, canselOder)

userRouter.get('/cancelProduct',auth.isLogged, canselSingleOrder)

userRouter.get('/return',auth.isLogged,returnOrder)



// wishlist--------------------

userRouter.get('/displayWishList',auth.isLogged,displayWishlist)

userRouter.post('/addToWishlist',auth.isLogged,addToWishList)

userRouter.post('/dltItemWshlst',auth.isLogged,dltItemWshlst)


//---------------------------------


//--------------coupon---------------
userRouter.post('/validateCoupon',auth.isLogged,validateCoupon)
//----------------------------------------



//------wallet--------------
userRouter.post('/addMoneyWallet',auth.isLogged,addMoneyWallet)
userRouter.post('/updateMongoWallet',auth.isLogged,updateMongoWallet)
userRouter.post('/useWallet',auth.isLogged,sumWallet)
userRouter.get('/sumWalletBuynow',auth.isLogged,sumWalletBuynow)
userRouter.post('/useWallet',auth.isLogged,useWallet)
//------------------=-------------


//---------------rating and review----
userRouter.post('/review',auth.isLogged,review)
//---------------------------------------------------------


//------------filter the things ----------------------
userRouter.post('/filterSearch',filterSearch)//filter seach bar by catogay main bar
userRouter.get('/priceFilter',priceFilter)//by price
userRouter.get('/CatogaryFilter',CatogaryFilter)//by catogary
userRouter.get('/clearFilter',clearFilter)//clear all the filter 
userRouter.get('/sortByPrice',sortByPrice)
//----------------------------------

module.exports = userRouter;

