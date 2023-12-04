const Coupon = require('../models/couponModel')
const User = require('../models/userModel');
const product = require('../models/productModel');
const category = require('../models/catogaryModel')
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const Oder = require('../models/orderModel')

const CreateCoupon= asyncHandler(async(req,res)=>{
try{
   console.log('entered for creating a coupon'); 
     
   res.render('createCoupon')


}catch(error){
    console.log(error,'error');
}
})



// coupon creation---

const addCoupon = asyncHandler(async(req,res)=>{
    try{
        console.log('entered to "addCoupon"');

        const couponName = req.body.name;
      const nameRegex = new RegExp(couponName, 'i');
      const existingCoupon = await Coupon.findOne({name: { $regex: nameRegex } });
   
      if (existingCoupon) {
         console.log('Coupon with same name already exists:', existingCoupon.name);
         const errorMessage = "Coupon with same name already exists";
         res.redirect(`/admin/createCoupon?error=${encodeURIComponent(errorMessage)}`)
      }else{
        const {name,description,offerAmount,minimumAmount,expiryDate}= req.body
     
        console.log(name,description,offerAmount,minimumAmount,expiryDate,'name','Description','offerAmount');

        const newCoupon= new Coupon({
           name:name,
           description:description,
           Amount:offerAmount,
           minimumAmount:minimumAmount,
           expiryDate:expiryDate,
           createdOn:Date.now()

        })
        const createdCoupon= await newCoupon.save()

        console.log(createdCoupon,'this is the created Coupon');

         if(createdCoupon){
            res.redirect('/admin/displayCoupon')
         }else{
            const errorMessage = "Some thing went wrong while creating coupon,check and try again later";
            res.redirect(`/admin/createCoupon?error=${encodeURIComponent(errorMessage)}`)
         }
      }
      

    }catch(err){
        console.log(err,'error')
    }
})

const displayCoupons=asyncHandler(async(req,res)=>{
    try{
        const everyCoupons= await Coupon.find({})
        console.log(everyCoupons,'everyCoupons');
        res.render('displayCoupons',{coupon:everyCoupons})

    }catch(error){
        console.log(error);
    }
})



const deleteCoupon= asyncHandler(async(req,res)=>{
    try{

        console.log('Entered to deleting coupon!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        const couponId= req.query.id
        console.log(couponId,'this is couponId for deleting coupon');
        if(couponId){
        console.log('going to delete coupon with this id',couponId);
            const dltCoupon= await Coupon.findByIdAndDelete(couponId)

            console.log(dltCoupon,'dltCoupon');
            res.redirect('/admin/displayCoupon')
        }else{
            res.json('coupon id not found')
        }
       
    }catch(error){
        console.log(error);
    }
})


const editCoupon= asyncHandler(async(req,res)=>{
    try{
   const couponId= req.query.id
   console.log(couponId);
   const couponDetails= await Coupon.findById(couponId)
   console.log(couponDetails,'couponDetails');
   if(couponDetails){
    res.render('editCoupon',{coupon:couponDetails})

   }else{
    console.log('coupon details not found');
    res.json('coupon details not found')
   }


    }catch(error){
        console.log(error,'error');
    }
})

const updateCoupon = asyncHandler(async (req, res) => {
    try {
        const { id, name, description, offerAmount, minimumAmount, expiryDate } = req.body;

        // Check if the coupon with the given ID exists
        const existingCoupon = await Coupon.findById(id);
        if (!existingCoupon) {
            console.log('Coupon not found, redirecting with error message');
            const errorMessage = 'Coupon not found';
            return res.redirect(`/admin/editCoupon?error=${encodeURIComponent(errorMessage)}`);
        }

        // Check if the new name is different from the existing name
        if (name !== existingCoupon.name) {
            const nameRegex = new RegExp(name, 'i');
            const checkData = await Coupon.findOne({ name: { $regex: nameRegex } });
            if (checkData) {
                console.log('Coupon name already exists, redirecting with error message');
                const errorMessage = 'Coupon name already exists';
                return res.redirect(`/admin/editCoupon?error=${encodeURIComponent(errorMessage)}`);
            }
        }

        console.log('before the condition checking (req.body.expiryDate>existingCoupon.createdOn)');

        console.log(req.body.expiryDate,existingCoupon.createdOn,'req.body.expiryDate,existingCoupon.createdOn');
        if(req.body.expiryDate<existingCoupon.createdOn){
            console.log('entered to req.body.expiryDate<existingCoupon.createdOn');
            console.log('Check the coupon expiery Date');
                const errorMessage = 'Check the coupon expiery Date';
                return res.redirect(`/admin/editCoupon?error=${encodeURIComponent(errorMessage)}`);
        }

        // Update the existing coupon
        const editedCoupon = await Coupon.findByIdAndUpdate(id, {
            name: name,
            description: description,
            Amount: offerAmount,
            minimumAmount: minimumAmount,
            expiryDate: expiryDate
        });

        console.log(editedCoupon, 'Updated coupon');

        // Check if the update was successful
        if (editedCoupon) {
            console.log('Coupon updated successfully, redirecting to displayCoupon');
            return res.redirect('/admin/displayCoupon');
        } else {  
            console.log('Something went wrong while updating the coupon');
            const errorMessage = 'Something went wrong while updating the coupon, please try again later';
            return res.redirect(`/admin/editCoupon?error=${encodeURIComponent(errorMessage)}`);
        }

    } catch (error) {
        console.error('Error:', error);
        const errorMessage = 'An error occurred while updating the coupon';
        return res.redirect(`/admin/editCoupon?error=${encodeURIComponent(errorMessage)}`);
    }
});



//-------------chekthe coupon is valid or not -----------------
const validateCoupon = asyncHandler(async (req, res) => {
    try {
      const name = req.body.couponCode;
      console.log(name,'couponCode');
  
      // Query the database to find the coupon by its name
      const coupon = await Coupon.findOne({ name: name });
      console.log(coupon,'this is the that found with',name,'this coupon name');
  
      if (coupon) {
        const user = await User.findById(req.session.user)
        const userId={
          userId:user._id
        }

    

        coupon.user.push(userId)
        await coupon.save()
        // If a coupon with the provided name is found, send it as a JSON response
        res.status(200).json({
          isValid: true,
          coupon: coupon, // Include the coupon data in the response
        });
      } else {
        // If no coupon with the provided name is found, send an error response
        res.status(404).json({
          isValid: false,
          error: 'Coupon not found',
        });
      }
    } catch (error) {
      console.log('Error happened in the coupon controller in the function validateCoupon', error);
      res.status(500).json({
        isValid: false,
        error: 'An error occurred while processing your request',
      });
    }
  });
//---------------------------------------------------------




//--------------------------------

module.exports={
    CreateCoupon,
    addCoupon,
    displayCoupons,
    deleteCoupon,
    editCoupon,
    updateCoupon,
    validateCoupon 
}