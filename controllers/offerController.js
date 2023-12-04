const User = require('../models/userModel');
const Product = require('../models/productModel');
const Category = require('../models/catogaryModel')


const asyncHandler = require('express-async-handler');
const Oder = require('../models/orderModel')

// loading product offer page---------------------------------------------------------

const ProductofferPage = asyncHandler(async(req,res)=>{
    try{
        // getting all products
        const products= await Product.find()
        console.log(products.length);
        const itemsperpage = 8;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(products.length / 8);
        const currentproduct = products.slice(startindex,endindex);
           if(products){
            // rendering the the the product offer page and passing product 
            res.render('productOffer',{product: currentproduct, totalpages, currentpage})
           }

    }catch(error){
        console.log(error,'error');
    }
})

// updating the product offer-------------------------------------------------
const updateProductOffer= asyncHandler(async(req,res)=>{
    try{
        
        const { id,offerPrice}= req.body
      console.log(id,offerPrice,'id,offerPrice');

        const product= await Product.findById(id)
           console.log(product,'product');

           product.offerPrice= offerPrice
           product.price= product.price-offerPrice

          await product.save()
 
            console.log(product.price,'updated product price');
            res.redirect('/admin/Product-offer-Page')

    }catch(error){
        console.log(error,'error');
    }
})
//-------------------------------------------------------------------------------------------


//-category--Offer----------------------------------------------------------------------
const categoryOffer= asyncHandler(async(req,res)=>{
    try{
         const category= await Category.find()
         console.log(category.length);
        const itemsperpage = 8;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(category.length / 8);
        const currentproduct = category.slice(startindex,endindex);
        res.render('categoryOffer',{catogary:currentproduct, totalpages, currentpage })  


    }catch(error){
        console.log(error,'error');
    }
})

//--------------------------------------------------------------------------------------

// Update Category Offer----------------------------------------------------
const updateCategoryOffert = asyncHandler(async (req, res) => {
    try {
        const { id, offerPercentage } = req.body;
        console.log(id, offerPercentage, 'id,offerPercentage');

        const gotcategory = await Category.findById(id);
        console.log(gotcategory, 'category');

        console.log(gotcategory.name, 'Category name before Product.find');
const products = await Product.find({ Category: gotcategory.name });

        console.log(products, 'these are the products with this category');

        if (products.length === 0) {
            return res.json('No products found in this category');
        }

        for (const product of products) {
            const newOfferPrice = (offerPercentage / 100) * product.price;
            const newPrice = product.price - newOfferPrice;

            // Update the product
            await Product.findByIdAndUpdate(product._id, {
                offerPrice: newOfferPrice,
                price: newPrice,
            });
        }

        // Redirect after all products have been updated
        res.redirect('/admin/category-offerPage');
    } catch (error) {
        console.log(error, 'error');
        // Handle errors appropriately
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




const updateCategoryOffer = asyncHandler(async (req, res) => {
    try {
        const { id, offerPercentage } = req.body;

        // Find the category
        const category = await Category.findById(id);

        // Find all products in the category
        const products = await Product.find({ catogary: category.name });

        // if (products.length === 0) {
        //     return res.json('No products found in this category');
        // }                  
        // Update prices based on the offer percentage
        products.forEach(async (product) => {
            const newOfferPrice = (offerPercentage / 100) * product.price;
            const newPrice = product.price - newOfferPrice;

            // Update the product
            await Product.findByIdAndUpdate(product._id, {
                offerPrice: newOfferPrice,
                price: newPrice,
            });
        });

        console.log('Updated prices for products in category:', category.name);

        res.redirect('/admin/category-offerPage');
    } catch (error) {
        console.log('Error happened in the offerctrl in the function updateCatogaryOffer:', error);
        // Handle the error appropriately, e.g., send an error response to the client
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
//--------------------------------------------------------------------------

//-------------------------------------------------------------
module.exports={
    ProductofferPage,
    updateProductOffer,
    categoryOffer,
    updateCategoryOffer
}