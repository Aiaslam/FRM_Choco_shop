const User = require('../models/userModel');
const nodeMailer = require('nodemailer')
const product = require('../models/productModel');
const catogary = require('../models/catogaryModel')
const Oder = require('../models/orderModel')
const asyncHandler = require('express-async-handler');

const Swal = require('sweetalert2');
const { logout } = require('./adminController');
const Banner= require('../models/bannerModel')

const bcrypt = require("bcrypt");
const otpStore = {}; // In-memory store for simplicity





//--------------hasinthe password------------------

const generateHashedPassword = async (password) => {
   const saltRounds = 10; // Number of salt rounds
   const salt = await bcrypt.genSalt(saltRounds);
   const hashedPassword = await bcrypt.hash(password, salt);
   return hashedPassword;
 };
//----------------------------------


//genarte a otp--------------------------------  
function generateotp() {
   var digits = "1234567890";
   var otp = "";
   for (i = 0; i < 6; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
   }
   console.log('this it the otp generated by generated by generate otp and return', otp);
   return otp;
}
//---------------------------------------------------------

//
const sendVerifyMail = async (username, email) => {
   try {


      console.log(username);
      console.log(email);

      let OTP = await generateotp();
      console.log(OTP, 'this is the otp that recived in send verify mail in line 81');
      // req.session.OTP = OTP;
      // req.session.frgtOTP = OTP;

      //otp exipiration

      // const otpExpiryTime = 1 * 60 * 1000; // OTP expires afte   r 1 minute


      // setTimeout(() => {

      //    console.log("OTP has expired for", username);
      // }, otpExpiryTime);

      const transporter = nodeMailer.createTransport({
         host: 'smtp.gmail.com',
         port: 587,
         secure: false,
         requireTLS: true,
         auth: {
            user: 'aliaslamnoushadj@gmail.com',
            pass: 'rkzz hqxq wtvq lzmv'
         }
      });







      const mailOptions = {
         from: 'aliaslamnoushadj@gmail.com',
         to: email,
         subject: 'for verification mail',
         text: `your otp is ${OTP}`,
         html: `<p> <h4> hii ${username}, your otp is ${OTP}.</h4> <br><a href="/api/user/emailOTP/">click here</a></br></p>`
      };

      const data = await transporter.sendMail(mailOptions);

      if (data) {
         return OTP;
      } else {
         console.log("Email sending failed.");
      }
   } catch (error) {
      console.error(error.message);
   }
};


//expirty otp

const expiryOTP=asyncHandler(async(req,res)=>{
   req.session.OTP=null
   res.json({status:true})
})



const expiryfrgtOTP=asyncHandler(async(req,res)=>{
   req.session.frgtOTP=null
   res.json({status:true})
})

const loadRegister = async (req, res) => {
   try {
      console.log('entered to load register')

      res.render('registration', { message: '', errMessage: '' })

   } catch (error) {
      console.log(error.message)
   }
}


const insertUser = async (req, res) => {
   try {
      // Log the request body value
      console.log(req.body.value, "!!!!!!!!!!!!!!!!!!!!!!!!!!");

      // Check if req.body.email is empty or undefined
      if (!req.body.email) {
         res.render('registration', { errMessage: 'Field required', message: '' });
      } else {
         const { email } = req.body;

         // Check if a user with the same email already exists in the database
         const checkData = await User.findOne({ email: email });
         console.log(checkData, "checkdata is here");

         if (checkData) {
            res.render('registration', { errMessage: 'User already exists', message: '' });
         } else {
            // Store req.body in the session
            req.session.userData = req.body;
            req.session.email = req.body.email
            req.session.username = req.body.username
            // Retrieve userSessionData from the session
            const userSessionData = req.session.userData;

            if (userSessionData) {
               // Assuming you have a sendVerifyMail function that sends an email
               // with a verification code and returns that code
               const response = await sendVerifyMail(userSessionData.username, userSessionData.email);
               req.session.OTP = Number(response);
               console.log(req.session.OTP);

               // const otpExpirationTime = 60 * 1000; // 60 seconds * 1000 milliseconds
               // const otpExpirationPromise = new Promise((resolve) => {
               //   setTimeout(() => {
               //     // Clear the OTP after one minute
               //     req.session.OTP = undefined;
               //     req.session.frgtOTP=undefined
               //     resolve();
               //   }, otpExpirationTime);
               // });
               res.render('emailOTP', { message: 'Registration successful, verify email', errMessage: '' });
            }
         }
      }
   } catch (error) {
      console.log(error.message);
   }
}
const forgetPassward = asyncHandler(async (req, res) => {
   try {
      res.render('forgotPassword')

   } catch (error) {
      console.log(error);
   }
})

const forgotpaswrdEmailValidate = asyncHandler(async (req, res) => {
   try {
      console.log('forgotpaswrdEmailValidate');
      const { email } = req.body;
      console.log(email);
      const userData = await User.find({ email });
      console.log(userData);

      if (userData && userData.length > 0) {
         for (const user of userData) {
            if (user && user.username && user.email) {
               console.log('this is the userdata.username and email', user.username, user.email);

               const response = await sendVerifyMail(user.username, user.email);
               req.session.frgtOTP = Number(response);

               console.log('this is req.session.frgtOTP before expiring time set in forgotpaswrdEmailValidate in line 168', req.session.frgtOTP);
               req.session.forgotEmail = req.body.email;

               const otpExpiryTime = 1 * 60 * 1000; // OTP expires after 1 minute
               req.session.otpExpirationTime = Date.now() + otpExpiryTime;
               console.log('Current time:', Date.now());
               console.log('OTP expiration time:', req.session.otpExpirationTime);

               // Render the template after sending OTP
               res.render('forgotPasswrdOTP', { message: 'Registration successful, verify email', errMessage: '' });

               // Optionally, you can check OTP expiration before processing entered OTP
               console.log('now it is going to check if (Date.now() > req.session.otpExpirationTime)');
               // if (Date.now() >= req.session.otpExpirationTime) {
               //    console.log('inside if (Date.now() > req.session.otpExpirationTime)');
               //    console.log("OTP has expired for", user.username);
               //    req.session.frgtOTP = undefined;
               //    console.log('now this is what inside req.session.frgtOTP', req.session.frgtOTP);
               //    console.log("OTP has expired for", user.username);
               // }
            } else {
               console.log('Invalid user data:', user);
               // Display SweetAlert for invalid user
               Swal.fire({
                  icon: 'error',
                  title: 'Invalid User',
                  text: 'No user found with the provided email.',
                  showCancelButton: false,
                  showConfirmButton: false,
                  timer: 3000, // 3 seconds
               });
            }
         }
      } else {
         // Handle the case when no user with the provided email is found.
         // Display SweetAlert for no user found
         console.log('No user found with the provided email.');
         Swal.fire({
            icon: 'error',
            title: 'Invalid User',
            text: 'No user found with the provided email.',
            showCancelButton: false,
            showConfirmButton: false,
            timer: 3000, // 3 seconds
         });
         res.redirect('/forgetPassward')
      }
   } catch (error) {
      console.log(error);
   }
});


const resendOtp = asyncHandler(async (req, res) => {
   try {
      console.log('Entered to resend OTP???????????????????????/////////////////////////////');
      console.log(req.session.email, 'req.session.email');
      const email = req.session.email
      const username = req.session.username
      // const userData = await User.find({ email });
      //  const username= req.session.username

      console.log('this is the email,username in resend otp :', email, username);

      // if (userData && userData.length > 0) {
      //    for (const user of userData) {
      //       console.log('this is the userdata.username and email', user.username, user.email);

      const response = await sendVerifyMail(username, email);
      req.session.OTP = Number(response);
      
      
      // const otpExpirationTime = 60 * 100; // 60 seconds * 1000 milliseconds
      //  const otpExpirationPromise = new Promise((resolve) => {
      //               setTimeout(() => {
      //       // Clear the OTP after one minute
      //       console.log('otp expired for forgect otp check whilt');
      //                 req.session.frgtOTP = undefined;
      //                  resolve();
      //               }, otpExpirationTime);
      //   });
       req.session.email = req.body.email;
      console.log(req.session.OTP);
       const errorMessage=' '
      res.render('emailOTP',{ errorMessage: errorMessage });
   
      // } else {
         // Handle the case when no user with the provided email is found.
         // You can send a response or render an error message.
      //    console.log('No user found with the provided email.');
      // }
   } catch (error) {
   console.log(error);
}
});




const forgotpaswrdResend = asyncHandler(async (req, res) => {
   try {
      const email = req.session.forgotEmail
      const userData = await User.find({ email });
      const username = req.session.username

      console.log('this is the userdata in forgotpaswrdEmailValidate :', userData);

      if (userData && userData.length > 0) {
         for (const user of userData) {
            console.log('this is the userdata.username and email', user.username, user.email);

            const response = await sendVerifyMail(user.username, user.email);
            req.session.frgtOTP = Number(response);
            const otpExpiryTime = 1 * 60 * 1000;
            setTimeout(() => {
               req.session.frgtOTP = undefined
               // req.session.OTP= undefined
               // You can handle OTP expiration here, e.g., clear the OTP or take appropriate action
               console.log('now this is what inside req.session.frgtOTP', req.session.frgtOTP);
               console.log("OTP has expired for", user.username);
            }, otpExpiryTime);
            // const otpExpirationTime = 60 * 100; // 60 seconds * 1000 milliseconds
            //  const otpExpirationPromise = new Promise((resolve) => {
            //               setTimeout(() => {
            //       // Clear the OTP after one minute
            //       console.log('otp expired for forgect otp check whilt');
            //                 req.session.frgtOTP = undefined;
            //                  resolve();
            //               }, otpExpirationTime);
            //   });
            req.session.forgotEmail =req.body.email
            console.log(req.session.frgtOTP);
            res.render('forgotPasswrdOTP', { message: 'Registration successful, verify email', errMessage: '' });

            req.session.frgtOTP=null

            // res.json({status:true})
         }
      } else {
         // Handle the case when no user with the provided email is found.
         // You can send a response or render an error message.
         console.log('No user found with the provided email.');
      }
   } catch (error) {
      console.log(error);
   }
});



const verifyOTPFrgt = asyncHandler(async (req, res) => {
   try {
      const { first, second, third, fourth, fifth, six } = req.body

      const enteredOTP = first + second + third + fourth + fifth + six
      console.log(enteredOTP, 'this is entered OTP');
      console.log(req.session.frgtOTP, 'req.session.frgtOTP');
      if (req.session.frgtOTP == undefined) {

         console.log('this otp has expired');
      }

      if (enteredOTP == req.session.frgtOTP) {

         res.render('resetPassword')
      } else {
         console.log('error occurd while checking the otp');
      }


   } catch (err) {

   }
})

const updatePassword = asyncHandler(async (req, res) => {
   try {
      const updatedPassword = req.body.conformPassword;
      console.log(updatedPassword);

      const forgotEmail = req.session.forgotEmail.replace(/[^a-zA-Z0-9.@]/g, '') 

console.log('Cleaned Forgot Email:', forgotEmail);

// Use a case-insensitive query with $regex
const existingUser = await User.findOne({ email: { $regex: new RegExp(forgotEmail, 'i') } });

console.log('MongoDB Query:', existingUser?._conditions);

console.log('Raw Forgot Email:', req.session.forgotEmail);


      if (!existingUser) {
         console.log('User not found with the specified forgotEmail:', forgotEmail);
         return res.status(404).json({ message: 'User not found' });
      }
      if(existingUser){
         const hashedPassword = await generateHashedPassword(req.body.conformPassword);

         console.log('before going to update everything is okay');
      existingUser.password = hashedPassword;
      const userData = await existingUser.save();
      console.log(userData);

      if (userData) {
         res.redirect('/login');
      } else {
         console.log('Error while updating password, userData:', userData);
         res.status(500).json({ message: 'Error while updating password' });
      }
      }
      
   } catch (err) {
      console.log(err);
      res.status(500).json({ message: 'Internal Server Error' });
   }
});



// otp page

const otpPage =asyncHandler(async(req,res)=>{
   try{
      console.log('entered to otp page');
      const errorMessage = req.query.error
      console.log(errorMessage);
      if(errorMessage !== undefined){

         res.render('EmailOTP1',{ errorMessage: errorMessage })

      }else{
         console.log('error message not found',errorMessage);
      }

   }catch(error){
      console.log(error);
   }
})

const loadLogin = async (req, res) => {
   try {

      res.render('login', { message: '' });

   } catch (error) {
      console.log(error.message);
   }
}

const verfiyUser = async (req, res) => {
   try {
      const email = req.body.email;
      console.log(email,'email inside verfyuser');
      const password = req.body.password;
      console.log(password,'email inside password');

      const userData = await User.findOne({ email:email });
      console.log(userData,'userData inside password');
      if (userData) {
         if ((await userData.isPasswordMatched(password))) {
            const productsData = await product.find({})
            req.session.user = userData._id
            // res.render('home', { user: userData ,products:productsData});
            res.redirect('/home')
         } else {
            res.render('login', { message: "Invalid email or password" });
         }
      } else {
         res.render('login', { message: 'Invalid email or password' })
      }

   } catch (error) {
      console.log(error.message)
   }
}
const shop = async (req, res) => {
   try {
      const user = req.session.user;
      const userData = await User.findById(user);

      // Pagination parameters
      const page = parseInt(req.query.page) || 1; // Current page, default to 1
      const limit = 10; // Number of products per page

      // Calculate the skip value based on the current page and limit
      const skip = (page - 1) * limit;

      // MongoDB aggregation pipeline with pagination
      const products = await product.aggregate([
         {
            $match: {
               status: { $ne: false },
               'category.status': { $ne: false },
            },
         },
         { $skip: skip }, // Skip documents
         { $limit: limit }, // Limit the number of documents
      ]);

      // Count all products to calculate total pages
      const totalProducts = await product.countDocuments({
         status: { $ne: false },
         'category.status': { $ne: false },
      });
      const totalPages = Math.ceil(totalProducts / limit);

      res.render('shop', { products: products, user: userData, totalPages, currentPage: page });
   } catch (error) {
      console.log(error);
   }
};

const loadHome = async (req, res) => {
   try {
      console.log('load home');
      const user = req.session.user;
      const page = req.query.page || 1; // Get the page parameter from the query string or default to 1
      const limit = 9; // Number of products per page

      if (user) {
         // const category = await catogary.find();
         const userData = await User.findById(user);
         const banner = await Banner.find()
         console.log(banner,'banner');
         const category = await catogary.aggregate([
            {
               $match: {
                  status: { $ne: false }
               }
            }
         ]);
         const products = await product.aggregate([
            {
               $match: {
                  status: { $ne: false },
                  'category.status': { $ne: false }
               }
            },
            {
               $skip: (page - 1) * limit
            },
            {
               $limit: limit
            }
         ]);

         console.log(products, 'products');
         req.session.Product = product;
         res.render("home", { products, user: userData, category, currentPage: page,banner });
      } else {
         const category = await catogary.aggregate([
            {
               $match: {
                  status: { $ne: false }
               }
            }
         ]);

         console.log('>>>>>>>', category);
         const banner = await Banner.find()
         console.log(banner,'banner');

         const products = await product.aggregate([
            {
               $match: {
                  status: { $ne: false },
                  'category.status': { $ne: false }
               }
            },
            {
               $skip: (page - 1) * limit
            },
            {
               $limit: limit
            }
         ]);

         console.log(products, 'products');
         req.session.Product = product;
         res.render("home", { user, products, category, currentPage: page ,banner});
      }
   } catch (error) {
      console.log("Error happens in loadhome:", error);
   }
};


// const loadHome = async (req, res) => {
//    try {
//       const userData=await User.find({})
//       const productsData = await product.find({})
//       res.render('home',{products:productsData ,user:userData})
//    } catch (error) {
//       console.log(error.message);
//    }
// }

const userLogout = async (req, res) => {
   try {
      req.session.user = null;
      res.redirect('/');
   } catch (error) {
      console.log(error.message);
   }
}

const verifyMail = async (req, res) => {
   try {
      console.log('verfymail is working 265');
      const userEnteredOTP = req.body;
      userEnteredOTP.otp = parseInt(userEnteredOTP.otp, 10); 
      const enteredOTP = userEnteredOTP.otp  
                                                   
      console.log('Entered OTP:', enteredOTP);
      console.log('Stored OTP:', req.session.OTP);
      if (req.session.OTP == undefined) {
         return res.status(400).json({ error: "OTP Expired." });
      }
      if (enteredOTP == req.session.OTP) {
         console.log('otp equelto checking is working at line 273')
         const userData = req.session.userData

         const hashedPassword = await generateHashedPassword(userData.password);

         const saveUserData = new User({
            username: userData.username,
            email: userData.email,
            password: hashedPassword,
            mobile: userData.phone
         })
         const savedUserData = await saveUserData.save()
         req.session.user = savedUserData._id
         console.log(req.session.user, 'this is the session user before routing home');
         if (savedUserData) {
            const productsData = await product.find({})
         
            res.status(200).json({ status: true, message: "User registered successfully!" });
         } else {
            // Handle the case where the update didn't modify any documents
            return res.status(500).json({ status: false, error: "User not found or update failed." });
         }
      } else {
         // Handle the case where the entered OTP is incorrect
         return res.status(400).json({ status: false, error: "Incorrect OTP. Please try again." });
      }  
   } catch (error) {
      console.error(error.message);
      return res.status(500).json({ status: false, error: "An error occurred while verifying OTP." });
   }
}
const aProducts = async (req, res) => {
   try {
      console.log('entered to aProduct');

      const userId = req.session.user;
      const user = await User.findById(userId);

      // Check if id is present in the query parameters
      const id = req.query.id;


      // Find the product by ID
      const products = await product.findById(id);
      console.log('product store in Product line253', user);

      // Find related products based on the category
      const relatedPr = await product.find({ Catogary: products.catogary }).limit(4);

      if (products) {
         console.log('entered to if (product and going to render aproduct)');
         res.render('aProduct', { product: products, user, relatedPr });
      } else {
         // Handle the case where the product is not found
         console.log('Product not found');
         res.status(404).send('Product not found');
      }
   } catch (error) {
      console.log('Error happence in product controller aProductPage function', error);
      // Handle the error appropriately, e.g., send a 500 internal server error response
      res.status(500).send('Internal Server Error');
   }
}


//------------categoryProduct---------------------
const categoryProduct = async (req, res) => {
   try {
      const categoryId = req.query.id;
      console.log(categoryId);

      // Assuming you have a 'category' field in your product schema
      const products = await product.find({ category: categoryId });

      console.log(products);

      res.render('catProduct', { products });
   } catch (err) {
      console.log(err);
      res.status(500).send('Internal Server Error');
   }
};

//verifying OTP

const otpCheck = async (req,res)=>{
   try{
      const enterOTP= req.body.enteredOTP
      console.log(enterOTP,'enterOTP');

      const sentedOTP =req.session.OTP                                        

      console.log(sentedOTP,'sentedOTP');

      if(enterOTP===sentedOTP){
         res.json({ status: 'success' });
      } else {
          // Incorrect OTP
          res.json({ status: 'error' });
      }

   }catch(error){
      console.log(error);
   }
}
//------------------------------------------------

const userAbout = async (req, res) => {
   try {
      const userId = req.session.user
      const userData = await User.findById(userId)
      console.log(userData.username);
      const orders = await Oder.find({ userId: userId }).sort({ createdOn: -1 });
      console.log(orders);
      res.render('userAccount', { user: userData, order: orders })


   } catch (error) {
      console.log(error, 'this error occur while rendering userAbout');
   }
}

const editProfile = async (req, res) => {
   try {
      const id = req.query.id;
      const userData = await User.findById(id)
      if (userData) {
         res.render('editUserProfile', { user: userData })
      }

   } catch (err) {
      console.log(err, 'this error happen while rendering editProfile');
   }
}


const updateUser = async (req, res) => {
   try {
      const userId = req.session.user
      const existingData = await User.findById(userId)
      if (existingData == req.body) {
         res.redirect('/userAbout')
      }

      else {
         const { username, mobile, email } = req.body

         console.log(username, mobile, email);


         const updatedUser = await User.findByIdAndUpdate(userId, {
            username: username,
            mobile: mobile,
            email: email
         })
         updatedUser.save()
         if (updatedUser) {
            res.redirect('/userAbout')
         }
      }


   } catch (error) {
      console.log(error);
   }
}
const getchangePassword = asyncHandler(async (req, res) => {
   try {
      const id = req.session.user

      console.log(id,'id of get change password ');
      const userData = await User.findById(id)

      console.log(userData,'userData in getchangePassword');
      res.render('changePassword', { user:userData })


   } catch (err) {
      console.log(err);
   }
})

// changing the password--------------------------------------------------------------------------------

const changePassword = asyncHandler(async (req, res) => {
   try {
    
      const { username, currentPassword, newPassword, confirmPassword } = req.body;
  
      const currentPasswordH = await generateHashedPassword(currentPassword);

      const newPasswordH = await generateHashedPassword(newPassword);

      const confirmPasswordH = await generateHashedPassword(confirmPassword);

      console.log(username, currentPassword, newPassword, confirmPassword, 'username, currentPassword, newPassword ,confirmPassword');
      console.log(username, 'username');
      console.log( currentPasswordH, newPasswordH, confirmPasswordH, ' currentPasswordH, newPasswordH ,confirmPasswordH');


      const id = req.body.userId
      console.log(id);
      const user = await User.findById(id);
      console.log(user);
        console.log(user.password,'user.password');

        console.log(currentPasswordH,'currentPasswordH');
      if ((await user.isPasswordMatched(currentPassword))) {

         console.log('inside the user.password == currentPasswordH');

         if (newPassword == confirmPassword) {

            console.log('inside the newPasswordH == confirmPasswordH');
            user.password = newPasswordH;
            console.log('going to user.save()');
            await user.save();
             console.log(user,'user after saving and next is redirect');
            res.redirect('/userAbout');
         } else {
            const errMessage = 'check the conformPassword'

         }

      } else {
         console.log('entered password is wrong check it ');

         res.redirect('/changePassword',{errMessage})
         
         const errMessage = 'Enter the correct current password '
      }

   } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Internal Server Error' });
   }
});
// ---------------------------------------------------------------------



// add Address---------------------------------------------------
const addAddress = asyncHandler(async (req, res) => {

   try {
      const user =req.session.user
      console.log(user,'req.session.user');
      const userData= await User.findById(user)
      res.render('addAddress',{user:userData})
   } catch (error) {
      console.log(error);
   }
})

const addAddresscheck = asyncHandler(async (req, res) => {
   try {
      res.render('addAddresscheck')
   } catch (error) {
      console.log(error);
   }
})

const addnewAddress = asyncHandler(async (req, res) => {
   try {
      const {
         fullName,
         mobile,
         region,
         pinCode,
         addressLine,
         areaStreet,
         ladmark,
         townCity,
         state,
         addressType,
      } = req.body;
      const id = req.session.user;
      const user = await User.findById(id);
      const newAddress = {
         fullName,
         mobile,
         region,
         pinCode,
         addressLine,
         areaStreet,
         ladmark,
         townCity,
         state,
         addressType,
         main: false,
      };
      if (user.address.length === 0) {
         newAddress.main = true;
      }
      user.address.push(newAddress);
      await user.save();
      console.log("Address added to user:", user);
      res.redirect("/userAbout");
   } catch (error) {
      console.log("Error happens in userControler addAddress function:", error);
   }
});

const addnewAddresscheck = asyncHandler(async (req, res) => {
   try {
      const {
         fullName,
         mobile,
         region,
         pinCode,
         addressLine,
         areaStreet,
         ladmark,
         townCity,
         state,
         addressType,
      } = req.body;
      const id = req.session.user;
      const user = await User.findById(id);
      const newAddress = {
         fullName,
         mobile,
         region,
         pinCode,
         addressLine,
         areaStreet,
         ladmark,
         townCity,
         state,
         addressType,
         main: false,
      };
      if (user.address.length === 0) {
         newAddress.main = true;
      }
      user.address.push(newAddress);
      await user.save();
      console.log("Address added to user:", user);
      res.redirect("/checkOut");
   } catch (error) {
      console.log("Error happens in userControler addAddress function:", error);
   }
});



const loadEditAddress = asyncHandler(async (req, res) => {
   try {
      const id = req.query.id;
      const userId = req.session.user;
      const user = await User.findById(userId);
      const address = user.address.id(id);
      res.render("editAddress", { user, address });
   } catch (error) {
      console.log(
         "Error hapents in userControler loadEditAdress function:",
         error
      );
   }
});

const updateEditedAddress = asyncHandler(async (req, res) => {
   try {
      const userId = req.session.user;
      const {
         fullName,
         mobile,
         region,
         pinCode,
         addressLine,
         areaStreet,
         ladmark,
         townCity,
         state,
         adressType,
         id,
      } = req.body;
      const user = await User.findById(userId);
      if (user) {
         const updatedAddress = user.address.id(id);
         console.log(updatedAddress);
         if (updatedAddress) {
            updatedAddress.fullName = fullName;
            updatedAddress.mobile = mobile;
            updatedAddress.region = region;
            updatedAddress.pinCode = pinCode;
            updatedAddress.addressLine = addressLine;
            updatedAddress.areaStreet = areaStreet;
            updatedAddress.ladmark = ladmark;
            updatedAddress.townCity = townCity;
            updatedAddress.state = state;
            updatedAddress.adressType = adressType;
            await user.save();

            res.redirect("/userAbout");
         } else {
            console.log("adress not found ");
         }
      }
   } catch (error) {
      console.log(
         "Error hapents in userControler updateEditedAddress function:",
         error
      );
   }
});

const deleteAddress = asyncHandler(async (req, res) => {
   try {
      const id = req.query.id;
      const userId = req.session.user;

      const deleteAdd = await User.findOneAndUpdate(
         { _id: userId },
         {
            $pull: { address: { _id: id } },
         },
         { new: true }
      );
      console.log("this that deleted address", deleteAdd);
      res.redirect("/userAbout");
   } catch (error) {
      console.log(
         "Error hapents in userControler udeletedAddress function:",
         error
      );
   }
});

module.exports = {
   loadRegister,
   insertUser,
   loadLogin,
   verfiyUser,
   loadHome,
   userLogout,
   verifyMail,
   aProducts,
   userAbout,
   editProfile,
   updateUser,
   addAddress,
   addnewAddress,
   deleteAddress,
   updateEditedAddress,
   loadEditAddress,
   forgetPassward,
   verifyOTPFrgt,
   forgotpaswrdEmailValidate,
   updatePassword,
   changePassword,
   getchangePassword,
   forgotpaswrdResend,
   categoryProduct,
   resendOtp,
   expiryOTP,
   addnewAddresscheck,
   addAddresscheck,
   otpCheck,
   otpPage,
   expiryfrgtOTP,
   shop

} 