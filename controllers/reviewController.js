// Create a new review for a product
const asyncHandler=require('express-async-handler')
const Oder=require('../models/orderModel')
const Product=require('../models/productModel')
require('mongoose').mongoose.BSON = require('bson');
const BSON = require('bson');







//-----------creteing a review-----------
const review = asyncHandler(async (req, res) => {
    try {

      console.log(BSON,'BSON');
        
      const userId = req.session.user;
      console.log(userId,'userId');
      const { comment, rating, productId, orderId } = req.body;
  
      console.log(comment, rating, productId, orderId ,'comment, rating, productId, orderId ');
      console.log('this is body ',req.body);
     
      const product = await Product.findById(productId);
console.log(product,'product in rating');

      const newRating = {
        star: Number(rating),
        review: comment,
        postedBy: new BSON.ObjectId(userId),
      };
      
console.log(newRating,'newRating and next is checking existingRatingIndex ');

  const existingRatingIndex = product.individualRatings.findIndex(
    (rating) => String(rating.postedBy) === String(userId)
  );

  console.log(existingRatingIndex,"<<<<<<<<<<<");

  if (existingRatingIndex !== -1) {
    // Update the existing rating if found
    product.individualRatings[existingRatingIndex] = newRating;
  } else {
    console.log('JJJJJJJ');
    // Add a new rating if not found
    product.individualRatings.push(newRating);
  }

  // Recalculate the average rating and total ratings
  const totalRatings = product.individualRatings.length;
  const sumRatings = product.individualRatings.reduce((sum, rating) => sum + rating.star, 0);
  const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

  // Update the product with the new average rating and total ratings
  product.rating = {
    average: averageRating,
    totalRatings: totalRatings,
  };
  console.log('Before serialization:', product);
  console.log('next is going to save the updatepr');
const updatePr = await product.save();
console.log('After serialization:', updatePr);
  

 
    res.redirect(`/user/aProducts?id=${productId}`);






    } catch (error) {
      console.log('Error Happened in review Ctrl in the function review', error);
    
    }
  });       
  //-------------------------------------------------
  




module.exports={
    review
}


