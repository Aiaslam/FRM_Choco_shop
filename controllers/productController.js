const User = require('../models/userModel');
const Product = require('../models/productModel');
const catogary = require('../models/catogaryModel')
const Oder = require('../models/orderModel')
const asyncHandler = require('express-async-handler');
const { log } = require('console');

const addToWishList = asyncHandler(async (req, res) => {
    try {
        const id = req.query.id;
        console.log(id, 'this is the product Id to add to wishlist');
        const user = req.session.user;
        console.log(user, 'this is the user id in the session');
        const userData = await User.findById(user);

        if (userData) {
            console.log(userData, 'userData');

            // Check if the product already exists in the wishlist
            const isProductInWishlist = userData.wishlist.some(item => item.ProductId === id);

            if (!isProductInWishlist) {
                userData.wishlist.push({
                    ProductId: id,
                });

                console.log(userData.wishlist, 'userData.wishlist before saving');
                await userData.save();
                console.log(userData.wishlist, 'userData.wishlist after saving');

                res.json({ success: true, message: 'Product added to wishlist successfully' });
            } else {
                res.json({ success: false, message: 'Product is already in the wishlist' });
            }
        } else {
            console.log('user data not found');
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

const displayWishlist =asyncHandler(async(req,res)=>{
try{
    const userid = req.session.user
    console.log(userid);
    const userData = await User.findById(userid)
    console.log(userData);
    const productIds = userData.wishlist.map(Item => Item.ProductId);

    console.log(productIds,'ProductIds');

  
        const product = await Product.find({ _id: { $in: productIds } });
        console.log(product,'these are products');

        const products=await Product.aggregate([{
            $match:{
                 _id: { $in: productIds },
               status:{$ne:false},
               'category.status': { $ne: false }
            }
         }])


         console.log(products,'products');
         res.render('wishList',{user:userData , products:product})

}catch(error){
    console.log(error);
}
})

const dltItemWshlst = asyncHandler(async(req,res)=>{
    try{
        const id = req.session.user
        const productId= req.query.id
        const userData = await User.findById(id)
        console.log(userData, 'this is the userdata in dltItem');

        if (userData) {
            const dltProduct = userData.wishlist.map(item => item.ProductId === productId)
            if (dltProduct) {
                console.log(dltProduct);
                userData.wishlist.splice(dltProduct, 1)
                await userData.save()

            }
            res.json({status:true})
        } 

    }catch(error){
        res.json({status:false})
        console.log(error);
    }
})

module.exports={
    displayWishlist,
    addToWishList,
    dltItemWshlst
}