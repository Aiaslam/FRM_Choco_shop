
const User = require('../models/userModel');
const product = require('../models/productModel');
const category = require('../models/catogaryModel')
const config = require('../config/connectDb');
const mongoose = require('mongoose');

const asyncHandler = require('express-async-handler');
const Oder = require('../models/orderModel')
const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');
const sharp = require('sharp');

const processAndStoreImage = require('../sharp/imageProcessing');
const { log } = require('console');


const loadLogin = async (req, res) => {
   try {

      res.render('login', { message: '' });

   } catch (error) {
      console.log(error.message);
   }
}

const verifyUser = async (req, res) => {

   try {
      console.log('entered to verifyUser');

      const email = req.body.email;
      const password = req.body.password;

      const userData = await User.findOne({ email: email });

      if (userData) {
         console.log('entered to passwordchecking');
         if (userData.password === password) {
            console.log('entered to  userData.is_admin === 0');
            if (userData.is_admin === 0) {
               console.log('out from  userData.is_admin === 0');

               res.render('login', { errorMessage: 'Invalid Admin' });
            } else {

               req.session.admin_id = userData._id;
               res.redirect('/admin/home');
            }
         } else {
            // In your server-side code
            res.render('login', { errorMessage: 'Invalid Password' });


         }
      } else {
         // In your server-side code
         res.render('login', { errorMessage: 'Invalid Admin' });


      }

   } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: 'Internal Server Error' });
   }

   // ------admin dashboarddisplay---------------------------


}
const loadhome = async (req, res) => {
   try {
      console.log('entered to load hpme');

      const latestOrders = await Oder.find().sort({ createdOn: -1 }).limit(5);
      const products = await product.find()
      // const orders = await Oder.find({ status: 'delivered' })
      const orders = await Oder.aggregate([{
         $match: {

            status: { $ne: 'delivered' },
            status: { $ne: 'cancelled' },

         }
      }])
      console.log(orders, 'this is the orders that i find using aggrigate');
      const catogaries = await category.find()

      const productCount = products.length
      const orderCount = orders.length
      const catogaryCount = catogaries.length

      const totalRevenue = orders.reduce((total, order) => total + order.totalPrice, 0)

      const monthlySales = await Oder.aggregate([
         {
            $match: {
               status: 'delivered',
            },
         },
         {
            $group: {
               _id: {
                  $month: '$createdOn'
               },
               count: { $sum: 1 },
            },
         },
         {
            $sort: {
               '_id': 1,
            },
         },
      ])
      const monthlySalesArray = Array.from({ length: 12 }, (_, index) => {
         const monthData = monthlySales.find((item) => item._id === index + 1);
         return monthData ? monthData.count : 0;
      });

      ///----------this is for the product data------
      const productsPerMonth = Array(12).fill(0);

      // Iterate through each product
      products.forEach(product => {
         // Extract month from the createdAt timestamp
         const creationMonth = product.createdAt.getMonth(); // JavaScript months are 0-indexed

         // Increment the count for the corresponding month
         productsPerMonth[creationMonth]++;
      });
      ///----------this is for the product data--end----

      console.log(orders);
      res.render('home', { totalRevenue, orderCount, productCount, catogaryCount, monthlySalesArray, productsPerMonth, latestOrders });

   } catch (error) {

      console.log(error.message)
   }
}

//----------------------------------------------------------------

const logout = async (req, res) => {
   try {
      req.session.admin_id = null;
      res.redirect('/admin')
   } catch (error) {
      console.log(error.message)
   }
}
const loadUser = async (req, res) => {
   try {
      const itemsPerPage = 3; // You can adjust this based on your preference
      const currentPage = parseInt(req.query.page) || 1;

      // Fetch all users
      const usersData = await User.find({ is_admin: 0 }).sort({ name: 1 });

      // Calculate pagination values
      const totalUsers = usersData.length;
      const totalPages = Math.ceil(totalUsers / itemsPerPage);
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const currentUsers = usersData.slice(startIndex, endIndex);

      res.render('listUser', { users: currentUsers, totalPages, currentPage });
   } catch (error) {
      console.log(error.message);
   }
};


const loadAddUser = async (req, res) => {
   try {

      res.render('newUser', { message: '', errMessage: '' })

   } catch (error) {
      console.log(error.message)
   }
}

const addUser = async (req, res) => {
   try {
      const checkData = await User.findOne({ email: req.body.email });
      if (checkData) {
         res.render('newUser', { message: '', errMessage: "User already founded" })
      } else {
         const user = new User({
            username: req.body.username,
            email: req.body.email,
            mobile: req.body.mobile,
            password: req.body.password
         })

         const userData = await user.save()
         if (userData) {
            res.redirect('/admin/users');
         }
      }


   } catch (error) {
      console.log(error.message)
   }
}


const editUserLoad = async (req, res) => {
   try {
      const id = req.query.id;
      const userData = await User.findById({ _id: id });
      if (userData) {
         res.render('editUser', { user: userData });
      } else {
         res.redirect('/admin/dashboard')
      }
   } catch (error) {
      console.log(error.message);
   }
}

const updateUser = async (req, res) => {
   try {
      const userData = await User.findByIdAndUpdate({ _id: req.body.id }, { $set: { name: req.body.name, email: req.body.email, mobile: req.body.mobile } })
      res.redirect('/admin/dashboard')
   } catch (error) {
      console.log(error.message)
   }
}

const deleteUser = async (req, res) => {
   try {
      const userData = await User.findOneAndRemove({ _id: req.query.id });
      res.redirect('/admin/dashboard');
   } catch (error) {
      console.log(error.message)
   }
}

const searchUser = async (req, res) => {
   try {
      const name = (req.body.name);
      const usersData = await User.find({ is_admin: 0, name: { $regex: name, $options: 'i' } }).sort({ name: 1 });
      res.render('dashboard', { users: usersData });
   } catch (error) {
      console.log(error.message)
   }
}

const blockUser = async (req, res) => {
   try {
      const id = req.query.id
      console.log('this is id', id);

      const blockUser = await User.findByIdAndUpdate(id, {
         isBlocked: true,
         isActive: true
      }, { new: true })

      console.log(blockUser);
      if (blockUser) {
         res.redirect('/admin/users')
      }

   } catch (error) {
      console.log(error)
   }
}

const unBlockUser = async (req, res) => {
   try {
      const id = req.query.id

      const unblockUser = await User.findByIdAndUpdate(id, {
         isBlocked: false,
         isActive: false
      }, { new: true })

      if (unblockUser) {
         req.session.userBloked = false;
         req.session.blockedMessage = "User is unblocked by admin.";

         res.redirect('/admin/users')
      }

   } catch (error) {
      console.log(error)
   }
}


// const loadAddProduct = async(req,res)=>{
//    try {
// const Categories= await category.find({})
// console.log(Categories);
// if(Categories){
//    res.render('addProduct',{Category:Categories})
// }



//    } catch (error) {
//       console.log("this is error",error.message)
//    }
// }
const loadAddProduct = async (req, res) => {
   try {

      const Categories = await category.find({});
      console.log(Categories);
      if (Categories) {
         let errorMessage = req.query.error;
         if (errorMessage) {

            res.render('addProduct', { Category: Categories, errorMessage });

         } else {

            errorMessage = ''

            res.render('addProduct', { Category: Categories, errorMessage });
         }
      }
   } catch (error) {
      console.log("This is error", error.message);
   }
}
const loadProduct = async (req, res) => {
   try {
      const userId = req.session.user;
      const user = await User.findById(userId);
      const Category = await category.find();
      console.log('Filters:', req.query);

      const {
         page = 1,
         limit = 10,
         sortBy = 'name',
         sortOrder = 'asc',
         nameFilter,
         categoryFilter,
         priceFilter
      } = req.query;

      const filter = {};
      if (nameFilter) filter.title = new RegExp(nameFilter, 'i');
      if (categoryFilter) filter.category = categoryFilter;

      const sortCriteria = {};
      sortCriteria[sortBy] = sortOrder === 'desc' ? -1 : 1;


      if (priceFilter === 'lowToHigh') {
         sortCriteria['price'] = 1;
      } else if (priceFilter === 'highToLow') {
         sortCriteria['price'] = -1;
      }

      const totalProducts = await product.countDocuments(filter);
      const totalPages = Math.ceil(totalProducts / limit);

      const products = await product
         .find(filter)
         .sort(sortCriteria)
         .skip((page - 1) * limit)
         .limit(Number(limit));

      if (req.accepts('html')) {
         res.render('productList', {
            products,
            Category,
            currentPage: page,
            totalPages
         });
      }
   } catch (error) {
      console.error('Error loading products:', error);
      res.status(500).send('Internal Server Error');
   }
};



const editProduct = async (req, res) => {
   try {
      const id = req.body.id;
      console.log("this is req.body", req.body);
      const img = req.files && req.files.length > 0 ? req.files[0].filename : null;

      if (img) {
         const images = [];
         if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
               images.push(req.files[i].filename);
            }
         }
         const products = req.body;

         const updatedPoduct = await product.findByIdAndUpdate(id, {
            title: products.title,
            discription: products.discription,
            price: products.price,
            quantity: products.quantity,
            category: products.category,

            images: images,
         }, { new: true })



      } else {
         console.log('this is >>>');
         const products = req.body;
         const noImg = await product.findByIdAndUpdate(id, {
            title: products.title,
            discription: products.discription,
            price: products.price,
            quantity: products.quantity,

            category: products.category,
         })

         console.log(noImg);
      }
      res.redirect('/admin/displayProduct')


   } catch (error) {
      console.log('Error happence in product controller productEdited function', error);
   }
}

const searchProduct = async(req,res)=>{
   try {
      console.log('entered to search product');
      const userId = req.session.user;
      const user = await User.findById(userId);
      const Category = await category.find();
      console.log('Filters:', req.query);

      const {
         page = 1,
         limit = 10,
         sortBy = 'name',
         sortOrder = 'asc',
         nameFilter,
         categoryFilter,
         priceFilter
      } = req.query;

      const filter = {};
      if (nameFilter) filter.title = new RegExp(nameFilter, 'i');
      if (categoryFilter) filter.category = categoryFilter;

      const sortCriteria = {};
      sortCriteria[sortBy] = sortOrder === 'desc' ? -1 : 1;


      if (priceFilter === 'lowToHigh') {
         sortCriteria['price'] = 1;
      } else if (priceFilter === 'highToLow') {
         sortCriteria['price'] = -1;
      }

      const totalProducts = await product.countDocuments(filter);
      const totalPages = Math.ceil(totalProducts / limit);
      const productname =( req.body.search);
      const productData = await product.find({title:{$regex:productname,$options :'i'}}).sort({title:1});
      console.log(productData,'productData');
         res.render('productList',{products:productData,Category,
            currentPage: page,
            totalPages});
   } catch (error) {
      console.log(error.message)
   }
}


// const addProduct = async (req, res) => {
//    console.log('entered to add product');
//    try {
//       const productTitle = req.body.title;
//       const titleRegex = new RegExp(productTitle, 'i');
//       const existingProduct = await product.findOne({ title: { $regex: titleRegex } });



//       if (existingProduct) {
//          console.log('Product already exists:', existingProduct.title);
//          const errorMessage = "Product already exists";
//          res.redirect(`/admin/addProduct?error=${encodeURIComponent(errorMessage)}`)
//       } else {
//          console.log('Creating a new product');

//          // Handle file uploads if available
//          const images = req.files.map(file => file.filename);

//          // Parse the croppedImageData JSON string into an array
//          const croppedImageData = JSON.parse(req.body.croppedImageArray || '[]');
//          console.log(croppedImageData.length, 'this is the length of croppedImageData');
//          // Create a new product instance
//          const newProduct = new product({
//             title: productTitle,
//             description: req.body.description,
//             price: req.body.price,
//             quantity: req.body.quantity,
//             images: images,
//             croppedImageData: croppedImageData,
//             category: req.body.category
//          });

//          // Save the new product to the database
//          const savedProduct = await newProduct.save();
//          console.log(savedProduct);
//          if (savedProduct) {
//             console.log('Product saved successfully:', savedProduct.title);
//             res.redirect('/admin/displayProduct');
//          }
//       }
//    } catch (error) {
//       console.error('Error saving product:', error);
//       res.render('addProduct', { message: '', errMessage: 'Failed to save product' });
//    }
// };
const addProduct = async (req, res) => {
   console.log('Entered to add product');
   try {
     const productTitle = req.body.title;
     const titleRegex = new RegExp(productTitle, 'i');      
     const existingProduct = await product.findOne({ title: { $regex: titleRegex } });
 
     if (existingProduct) {
       console.log('Product already exists:', existingProduct.title);
       const errorMessage = "Product already exists";
       return res.redirect(`/admin/addProduct?error=${encodeURIComponent(errorMessage)}`);
     } else {
       console.log(req.files);  // Check the uploaded files (including 'images')

       if (!req.files || req.files.length < 4) {
         // Handle the case where files are not uploaded as expected
         console.log('Files not uploaded as expected');
         return res.status(400).send('Bad Request: Files not uploaded as expected');
       }

       const images = [];
       for (let i = 0; i < 4; i++) {
         images.push(`${req.files[i].filename}`);
       }

       const { title, description, price, quantity, category } = req.body;
 
       const Product = new product({
         title,
         description,
         price,
         quantity,
         category,
         images,
       });
 
       console.log('Product:', Product);
       const savedProduct = await Product.save();
       if (savedProduct) {
         // Assuming you want to clear the session after saving the product
         req.session.filename = [];
         return res.redirect('/admin/displayProduct');
       }
     }
   } catch (err) {
     console.log(err);
     // Handle errors appropriately, e.g., send an error response to the client
     return res.status(500).send('Internal Server Error');
   }
 };

 


//  list and unlist the product ----------------------

const unlistProduct = asyncHandler(async (req, res) => {
   try {
      const id = req.query.id;
      console.log(id, 'id');
      const unlistedProduct = await product.findByIdAndUpdate(id, {
         status: false
      }, { new: true });


      res.redirect('/admin/displayProduct')
   } catch (error) {
      console.log('error happence in catogaryController unlistProduct function', error);
   }
})
//---------------------------------------------------



//-------------------list a product-----------------------
const listProduct = asyncHandler(async (req, res) => {
   try {
      const id = req.query.id;
      const listedProduct = await product.findByIdAndUpdate(id, {
         status: true
      }, { new: true });


      res.redirect('/admin/displayProduct')

   } catch (error) {
      console.log('error happence in catogaryController listProduct function', error);
   }
})

//--------------------------------------------------------------------------

// list category------------------------------------------
const ListCategory = asyncHandler(async (req, res) => {
   try {
      console.log('entered to list category');

      const id = req.query.id;
      console.log(id, 'in listcategory');
      const listedCategory = await category.findByIdAndUpdate(id, {
         status: true
      }, { new: true });
      console.log(listedCategory, 'listedCategory');

      res.redirect('/admin/listcategory');
   } catch (err) {
      console.log(err);
   }
});

//----------------------------------------------------------------------

//-----unlistcategory------------------------------------------------

const unlistCategory = asyncHandler(async (req, res) => {
   try {
      const id = req.query.id;
      console.log(id, 'in unlistCategory');
      const unlistedcategory = await category.findByIdAndUpdate(id, {
         status: false
      }, { new: true });
      console.log(unlistedcategory, 'unlistedcategory');
      res.redirect('/admin/listcategory');
   } catch (err) {
      console.log(err);
   }
});

const loadlistCategory = async (req, res) => {
   try {
      const usersCategory = await category.find();
      console.log('usersCategory')
      req.session.Catogary = usersCategory
         ;
      const itemsperpage = 3;
      const currentpage = parseInt(req.query.page) || 1;
      console.log('Current Page:', currentpage);
      const startindex = (currentpage - 1) * itemsperpage;
      const endindex = startindex + itemsperpage;
      const totalpages = Math.ceil(usersCategory.length / 3);
      const currentproduct = usersCategory.slice(startindex, endindex);


      res.render('listcategory', { Category: currentproduct, totalpages, currentpage, })
   } catch (error) {
      console.log(error.message)
   }
}
const loadCreateCategory = async (req, res) => {
   try {
      const errorMessage = req.query.error || '';

      res.render('createCategory', { error: errorMessage });

   } catch (error) {
      console.log(error.message);
   }
}
// const CreateCategory= async (req, res) => {
//    try {
//       const {name,description}=req.body;

//       if(!description){ 
//          return res.status(400).send('description required')

//       }

//      const checkData = await category.findOne({ name });

//      if (checkData) {
//        console.log('after checking data in add product');
//        return res.status(400).send('Category already exists');
//      } else {
//        console.log('working');

//        const newCategory = new category({
//          name: name,
//          description: description, // Fixed field name
//         image: req.file.filename
//     });

//        const categoryData = await newCategory.save();
//        if (categoryData) {
//          console.log('sucesessfully saved');
//          res.redirect('/admin/createCategory');
//        }
//      }
//    } catch (error) {
//      console.log(error.message);
//    }
//  };


// const CreateCategory = async (req, res) => {
//    try {
//      const { name, description, croppedImageData } = req.body;
//      const NameRegex = new RegExp(name, 'i');


//      console.log(croppedImageData);

//      const checkData = await category.findOne({ name: { $regex: NameRegex } });

//      if (checkData) {
//        const errMessage = 'Category already exists';
//        res.redirect(`/admin/createCategory?error=${encodeURIComponent(errMessage)}`);
//      } else {
//       console.log(req.body.croppedImageData);


//       console.log(croppedImageData);


//        const newCategory = new category({
//          name: name,
//          description: description,
//          image:req.file.filename , 
//          croppedImageData:croppedImageData,
//        });


//        const savedData = await newCategory.save();
//        if (savedData) {
//          res.redirect('/admin/listcategory');
//        }
//      }
//    } catch (error) {
//      console.error(error);
//      res.status(500).send('Internal Server Error');
//    }
//  };

const CreateCategory = async (req, res) => {
   try {
      const { name, description, croppedImageData, type } = req.body;
      const NameRegex = new RegExp(name, 'i');

      const checkData = await category.findOne({ name: { $regex: NameRegex } });

      if (checkData) {
         const errMessage = 'Category already exists';
         res.redirect(`/admin/createCategory?error=${encodeURIComponent(errMessage)}`);
      } else {
         const newCategory = new category({
            name: name,
            description: description,
            image: req.file.filename,
            type: type,
            croppedImageData: croppedImageData,
         });

         const savedData = await newCategory.save();
         if (savedData) {
            res.redirect('/admin/listcategory');
         }
      }
   } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
   }
};


const editCategory = async (req, res) => {
   try {
      const id = req.query.id;

      const Category = await category.findById(id)

      if (Category) {
         res.render('editCatogary', { Category: Category })
      } else {
         res.redirect('/admin/listcategory')

      }



   } catch (error) {
      console.log('error happence in catogaryController editCatogary function', error);
   }
}

// const updateCategory = async (req, res) => {
//    try {
//       const { name, discription, croppedImageData, type } = req.body;
//       const id = req.body.id; // Assuming id is a string or a valid ObjectId
//        console.log(name,'name');
//        console.log(discription,'discription');
//       console.log('Entering to check whether it existingCategory');

//       // Use findById without wrapping id in an object
//       const existingCategory = await category.findById(id);

//       console.log('After checking the existing or not using aggregate existingCategory and entering to if (!existingCategory) {', existingCategory);

//       if (!existingCategory) {
//          return res.send('Category not found');
//       }

//       if (name !== existingCategory.name) {
//          const NameRegex = new RegExp(name, 'i');
//          const checkData = await category.findOne({ name: { $regex: NameRegex } });

//          if (checkData) {
//             const errMessage = 'Category with the same name already exists';
//             return res.redirect(`/admin/editCategory?error=${encodeURIComponent(errMessage)}`);
//          }
//       }

//       console.log('Going to updateObject+*************************************');

//       const updateObject = {
//          name: name,
//          description:discription, // Fixed typo 'discription' to 'description'
//          type:type
//       };  

//       if (req.file) {
//          // If a new image is provided, add it to the update object
//          updateObject.image = req.file.filename;
//          updateObject.croppedImageData = croppedImageData;
//       }

//       console.log(id, updateObject, 'id, updateObject,');
//       // Use findByIdAndUpdate with correct arguments
//       const updatedCategory = await category.findByIdAndUpdate(id, updateObject, { new: true });

//       if (req.file) {
//          console.log('Category updated with image');
//       } else {
//          console.log('Category updated without image');
//       }

//       res.redirect('/admin/listcategory');
//    } catch (error) {
//       console.log('Error occurred in categoryController updateCategory function', error);
//       res.status(500).send('Internal Server Error');
//    }
// };

// ----------updating the editer category-------------------------------------------------

const updateCategory = asyncHandler(async (req, res) => {
   try {
      const name = req.body.name
      const discription = req.body.discription
      const type = req.body.type
      const croppedImageData = req.body.croppedImageData

      const id = req.body.id
      console.log(id);
      const existingCategory = category.findById(id)
      if (!existingCategory) {
         console.log('already not exist so passing error message');
         let errMessage = 'category not found'
         return res.redirect(`/admin/editCategory?error=${encodeURIComponent(errMessage)}`);
      } else {
         if (name !== existingCategory.name) {
            const NameRegex = new RegExp(name, 'i');
            const checkData = await category.findOne({ name: { $regex: NameRegex } });
            if (checkData) {
               console.log('already name exist so passing error message');
               let errMessage = 'category name already exist'
               return res.redirect(`/admin/editCategory?error=${encodeURIComponent(errMessage)}`);

            }

         }
         console.log(name, 'name');
         console.log(discription, 'discription');
         console.log(type, 'type');
         console.log('already name not exist so updating');
         const catogary = req.body;
         if (req.file) {

            console.log(catogary);
            const updatedcategory = await category.findByIdAndUpdate(id, {
               name: catogary.name,
               discription: catogary.discription,
               type: catogary.type,
               image: req.file,
            }, { new: true })
         } else {

            const updatedcategory = await category.findByIdAndUpdate(id, {
               name: catogary.name,
               discription: catogary.discription,
               type: catogary.type,

            }, { new: true })


         }
         ;

         res.redirect('/admin/listcategory');


         // const updateddata = {
         //    name: name,
         //    discription: discription,
         //    type: type
         // }
         // console.log('checking file exist');

         // console.log(updateddata,'updateddata');
         // if (req.file) {
         //    updateddata.image = req.file;
         //    updateddata.croppedImageData = croppedImageData;
         // }
         // console.log('finally going to save');
         // const saveupdates = await category.findOneAndUpdate({ id }, updateddata, { new: true })
         // console.log('saved!', saveupdates);

         // res.redirect('/admin/listcategory')

      }


   } catch (error) {
      console.log(error);
   }
})

//------------------------------------------------------------------------------------------------------


const deleteCatogary = async (req, res) => {
   try {
      const id = req.query.id;
      await category.findByIdAndDelete(id)
      res.redirect('/admin/listcategory')

   } catch (error) {
      console.log('error occured', error);
   }
}



// const deleteCatogary = async (req, res) => {
//     try {
//         const categoryId = req.query.id;

//         // Use aggregation to find and delete the category
//         const deletedCategory = await Category.aggregate([
//             {
//                 $match: {
//                     _id: mongoose.Types.ObjectId(categoryId),
//                 },
//             },
//             {
//                 $project: {
//                     _id: 1,
//                     image: 1,
//                     croppedImageData: 1,
//                     name: 1,
//                     description: 1,
//                     status: 1,
//                 },
//             },
//             {
//                 $lookup: {
//                     from: 'products', // Assuming your Product model is named 'Product'
//                     localField: '_id',
//                     foreignField: 'category',
//                     as: 'products',
//                 },
//             },
//             {
//                 $unwind: {
//                     path: '$products',
//                     preserveNullAndEmptyArrays: true,
//                 },
//             },
//             {
//                 $project: {
//                     _id: 1,
//                     image: 1,
//                     croppedImageData: 1,
//                     name: 1,
//                     description: 1,
//                     status: 1,
//                     productCount: {
//                         $cond: {
//                             if: { $isArray: '$products' },
//                             then: { $size: '$products' },
//                             else: 0,
//                         },
//                     },
//                 },
//             },
//         ]);

//         if (deletedCategory.length === 0) {
//             // Category not found
//             return res.status(404).json({ status: false, error: 'Category not found' });
//         }

//         // Delete the category
//         await Category.deleteOne({ _id: mongoose.Types.ObjectId(categoryId) });

//         // Redirect to the category list page
//         res.redirect('/admin/listcategory');
//     } catch (error) {
//         console.error('Error occurred in deleteCatogary:', error);
//         res.status(500).json({ status: false, error: 'Server error', details: error.message });
//     }
// };


const editProductPage = async (req, res) => {
   try {
      console.log('entered to edit product page');
      const productId = req.query.id;
      const Category = await category.find({})

      console.log(Category);
      const Product = await product.findById(productId);

      res.render('editProduct', { productId, Product, Category });

   } catch (error) {
      console.error('Error fetching product for editing:', error);

   }
};

const aProductPage = async (req, res) => {
   try {



      const userId = req.session.User;
      const user = await User.findById(userId)
      const id = req.query.id
      const Product = await product.findById(id)
      const relatedPr = await product.find({ category: product.category }).limit(4)
      if (Product) {



         res.render('aProduct', { Product: Product, user, relatedPr })
      }

   } catch (error) {
      console.log('Error happence in product controller aProductPage function', error);


   }
}
const deleteSingleImage = async (req, res) => {
   try {
      console.log(req.query);
      const id = req.query.id;
      const imageToDelete = req.query.img;


      const Product = await product.findByIdAndUpdate(id, {
         $pull: { images: imageToDelete }
      });


      const imagePath = path.join('public', 'admin', 'assets', 'imgs', 'catogary', imageToDelete);
      try {
         await fs.access(imagePath);

         await fs.unlink(imagePath);
         console.log('Deleted image:', imageToDelete);
      } catch (error) {

         console.log('File not found:', imagePath);
      }

      console.log('Deleted image:', imageToDelete);

      res.redirect(`/admin/editProduct?id=${Product._id}`);
   } catch (error) {
      console.log('Error occurred in categoryController deleteSingleImage function', error);

   }
}
const dltProduct = async (req, res) => {
   try {
      const dltid = req.query.id
      await product.findByIdAndDelete(dltid)
      res.redirect('/admin/displayProduct')

   } catch (error) {
      console.log(error, 'error occure')
   }
}


const uploadCroppedImage = async (req, res) => {
   try {
      const croppedImages = req.body.croppedImageArray; // Assumes you're using a library like Multer for file uploads
      console.log(croppedImages, 'this iiiiiiisssssssssss croppedImagescroppedImagescroppedImagescroppedImages');
      const processedImageUrls = [];
      for (const croppedImage of croppedImages) {
         // Process and store the image
         const processedImage = await processAndStoreImage(croppedImage);
         processedImageUrls.push(processedImage);
      }

      // Respond with processed image URLs
      res.json({ imageUrls: processedImageUrls });
   } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Image processing failed' });
   }
};



module.exports = {
   loadLogin,
   verifyUser,
   loadhome,
   logout,
   loadUser,
   loadAddUser,
   addUser,
   editUserLoad,
   updateUser,
   deleteUser,
   searchUser,
   loadAddProduct,
   loadProduct,
   addProduct,
   loadCreateCategory,
   CreateCategory,
   loadlistCategory,
   editCategory,
   updateCategory,
   deleteCatogary,
   editProduct,
   editProductPage,
   blockUser,
   unBlockUser,
   aProductPage,
   deleteSingleImage,
   dltProduct,
   uploadCroppedImage,
   listProduct,
   unlistProduct,
   unlistCategory,
   ListCategory,
   searchProduct

}