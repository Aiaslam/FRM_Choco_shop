
const express = require('express');
const adminRouter = express();
const nocache = require('nocache')
const logger = require('morgan')
const session = require('express-session');
const config = require('../config/connectDb');
const path = require('path');
const sharp = require('sharp');


adminRouter.use(express.static('public'))


// adminRouter.use(session({
//   secret: config.sessionSecretId,
//   resave: false,
//   saveUninitialized: false,
// }))

//----------multer setting---------------
const {
  upload
} = require('../multer/multer')

const uploadprd = require('../multer/multerproduct')
//----------------------------------------







const bodyParser = require('body-parser');
adminRouter.use(nocache())

adminRouter.use(logger('dev'))
adminRouter.set('view engine', 'ejs')
adminRouter.set('views', './views/admin')
// Serve static files from the 'public' directory
// adminRouter.use(express.static('public'));


adminRouter.use(bodyParser.json());
adminRouter.use(bodyParser.urlencoded({ extended: true }));

const auth = require('../middleweare/admin_authentication');
const adminController = require('../controllers/adminController')

const { orderListing,
  oderDetailsAdmin,
  changeStatusPending,
  changeStatusConfirmed,
  changeStatusShipped,
  changeStatusDelivered,
  changeStatusreturned,
  changeStatusCanseled,
  loadSalesReport,
  salesReport,
  CanceledsalesReport,
  loadCanceledSalesReport

} = require('../controllers/orderController')

const{
  CreateCoupon,
  addCoupon,
  displayCoupons,
  deleteCoupon,
  editCoupon,
  updateCoupon

}= require('../controllers/couponController')


const {
  ProductofferPage,
  updateProductOffer,
  categoryOffer,
  updateCategoryOffer
}= require('../controllers/offerController')


const {
  dltBanner,
  updateBannerData,
  editBanner,
  createBanner,
  addBanner,
  banner
}=require('../controllers/bannerController')

adminRouter.get('/', auth.isLogout, adminController.loadLogin);
// adminRouter.post('/admin/a',adminController.verifyUser); 
// adminRouter.post('/admin/a', adminController.verifyUser);
adminRouter.get('/loadLogin', auth.isLogout, adminController.loadLogin)
adminRouter.post('/home', adminController.verifyUser);
adminRouter.get('/home', auth.isAdminAuth, adminController.loadhome);
adminRouter.get('/logout', auth.isAdminAuth, adminController.logout);
adminRouter.get('/users', auth.isAdminAuth, adminController.loadUser);
adminRouter.get('/newUser', auth.isAdminAuth, adminController.loadAddUser);
adminRouter.post('/newUser', auth.isAdminAuth, adminController.addUser);
adminRouter.get('/editUser', auth.isAdminAuth, adminController.editUserLoad);
adminRouter.post('/editUser', auth.isAdminAuth, adminController.updateUser);
adminRouter.get('/deleteUser', auth.isAdminAuth, adminController.deleteUser);
adminRouter.get('/blockUser', adminController.blockUser)
adminRouter.get('/unBlockUser', adminController.unBlockUser)

adminRouter.get('/displayProduct', auth.isAdminAuth, adminController.loadProduct)
adminRouter.post('/addProduct', uploadprd.array('images', 4), adminController.addProduct)
adminRouter.get('/addProduct', auth.isAdminAuth, adminController.loadAddProduct)
// Define a route for editing a product
adminRouter.post('/uploadCroppedImage', upload.array('images', 12), adminController.uploadCroppedImage)

adminRouter.get('/editProduct', auth.isAdminAuth, adminController.editProductPage); // Page for editing
adminRouter.post('/editproduct', uploadprd.array('images', 12), adminController.editProduct);     // Handling the form submission
adminRouter.get('/deleteProduct', auth.isAdminAuth, adminController.dltProduct)
adminRouter.get('/deleteSingleImage', auth.isAdminAuth, adminController.deleteSingleImage)
adminRouter.get('/unlistProduct',auth.isAdminAuth,adminController.unlistProduct)
adminRouter.get('/listProduct',auth.isAdminAuth,adminController.listProduct)

adminRouter.post('/searchProduct',adminController.searchProduct)
// list and unlist category routes
// adminRouter.post('/ListCategory', auth.isAdminAuth, adminController.ListCategory);

// adminRouter.post('/unlistCategory', auth.isAdminAuth, adminController.unlistCategory);


adminRouter.get('/createCategory', auth.isAdminAuth, adminController.loadCreateCategory)
adminRouter.get('/listcategory', auth.isAdminAuth, adminController.loadlistCategory)
adminRouter.get('/editCategory', adminController.editCategory)
adminRouter.post('/updateCatogary', upload.single('image'), adminController.updateCategory)
adminRouter.post('/createCategory', upload.single('image'), adminController.CreateCategory)
adminRouter.post('/searchUser', adminController.searchUser);
// list and unlist category routes
adminRouter.get('/listingCategory', auth.isAdminAuth, adminController.ListCategory);

adminRouter.get('/unlistCategory', auth.isAdminAuth, adminController.unlistCategory);

adminRouter.get('/deleteCategory', auth.isAdminAuth, adminController.deleteCatogary)
// adminRouter.get('*',(req,res)=>{console.log('exeptional cauuse is working *'),res.redirect('/admin')})

adminRouter.get('/orderListing', auth.isAdminAuth, orderListing)
adminRouter.get('/oderDetailsadmin', auth.isAdminAuth, oderDetailsAdmin)
adminRouter.get('/changeStatusPending', auth.isAdminAuth, changeStatusPending)
adminRouter.get('/changeStatusConfirmed', auth.isAdminAuth, changeStatusConfirmed)
adminRouter.get('/changeStatusShipped', auth.isAdminAuth, changeStatusShipped)
adminRouter.get('/changeStatusDelivered', auth.isAdminAuth, changeStatusDelivered)
adminRouter.get('/changeStatusreturned', auth.isAdminAuth, changeStatusreturned)
adminRouter.get('/changeStatusCanseled', auth.isAdminAuth, changeStatusCanseled)
//------------------------------------------------------------
adminRouter.get('/salesReportPage', auth.isAdminAuth, loadSalesReport)

adminRouter.get('/salesReport', auth.isAdminAuth, salesReport)

adminRouter.get('/graphReport', auth.isAdminAuth, adminController.graphReport)

adminRouter.get('/CanceledsalesReportPage', auth.isAdminAuth, loadCanceledSalesReport)
            
adminRouter.get('/CanceledsalesReport', auth.isAdminAuth, CanceledsalesReport)

//---------------------------------------------------------

// sales report---------------


// coupon management---------------------------------------------------------------------

adminRouter.get('/createCoupon',auth.isAdminAuth,CreateCoupon)
adminRouter.post('/addCoupon',auth.isAdminAuth,addCoupon)
adminRouter.get('/displayCoupon',auth.isAdminAuth,displayCoupons)
adminRouter.get('/deleteCoupon',auth.isAdminAuth,deleteCoupon)
adminRouter.get('/editCoupon',auth.isAdminAuth,editCoupon)
adminRouter.post('/updateCoupon',auth.isAdminAuth,updateCoupon)
//----------------------------------------------------------------------------------------

//----------Offer Management-------------------------------
adminRouter.get('/Product-offer-Page',auth.isAdminAuth,ProductofferPage)
adminRouter.post('/update-Product-Offer',auth.isAdminAuth,updateProductOffer)

//-------------category offer management--------------------------------
adminRouter.get('/category-offerPage',auth.isAdminAuth,categoryOffer)

adminRouter.post('/update-Category-Offer',auth.isAdminAuth,updateCategoryOffer)
//---------------------------------------------------------


//------------Banner Management-----------

//add banner (page render)
adminRouter.get('/add-Banner',auth.isAdminAuth,addBanner)

//Create Banner (creating the banner)
adminRouter.post('/create-Banner',upload.single('image'),auth.isAdminAuth,createBanner)

//Edit Banner (rendering page to edit )
adminRouter.get('/edit-Banner',auth.isAdminAuth,editBanner)

//update Banner (saveing the edits and updating)
adminRouter.post('/update-Banner',upload.single('image'),auth.isAdminAuth,updateBannerData)

//Deleting the banner
adminRouter.get('/delete-Banner',auth.isAdminAuth,dltBanner)

//display the banners(rendering all banners)
adminRouter.get('/display-Banner',auth.isAdminAuth,banner)


//---------Banner Management over--------------------

module.exports = adminRouter; 