const User = require('../models/userModel')
const Product = require('../models/productModel')
const asyncHandler = require('express-async-handler');





//---Add to cart--------------------------------------------------------------------

// const addToCart = asyncHandler(async (req, res) => {
//     try {
//         console.log('entered to add to cart');
//         const productId = req.query.id;
//         console.log(productId, 'productId');
//         const user = req.session.user;
//         const product = await Product.findById(productId);
//         const userData = await User.findById(user);

//         if (userData) {
//             const existingCartItem = userData.cart.find((item) => item.ProductId == productId);
//             console.log(existingCartItem, 'existingCartItem');

//             if (existingCartItem) {
//                 console.log(existingCartItem.quantity, existingCartItem.subTotal, 'existingCartItem.subTotal, existingCartItem BEFORE');
//                 console.log('so the product is existing');
//                 existingCartItem.quantity += 1;
//                 existingCartItem.subTotal = product.price * existingCartItem.quantity;
//                 console.log(existingCartItem.quantity, existingCartItem.subTotal, 'existingCartItem.subTotal, existingCartItem after');
//             } else {
//                 userData.cart.push({
//                     ProductId: productId,
//                     quantity: 1,
//                     subTotal: product.price, // Initialize subtotal with product price
//                 });
//             }

//             // Update the total cart value based on the sum of all subtotals
//             userData.cartTotal = userData.cart.reduce((total, item) => total + item.subTotal, 0);

//             // Save the updated user document
//             await userData.save();
//             console.log(userData.cart);
//         }

//         res.json({ status: true });
//     } catch (error) {
//         console.log('Error occurred in addToCart', error);
//         res.status(500).json({ status: false, error: "Server error" });
//     }
// });

//-------------add a product to a cart -----------------------
const addToCart = asyncHandler(async (req, res) => {
    try {
        const id = req.query.id;
        const user = req.session.user;

        // Find the product by its ID
        const product = await Product.findById(id);


        if(product.quantity >= 1 ){
            const userData = await User.findById(user);

            if (userData) {
                // Check if the product is already in the cart
                const existingCartItem = userData.cart.find(item => item.ProductId === id);
    
                if (existingCartItem) {
                    // If the product is already in the cart, increment the quantity and update the subtotal using $inc
                    const updated = await User.updateOne(
                        { _id: user, 'cart.ProductId': id },
                        {
                            $inc: {
                                'cart.$.quantity': 1, // Increment the quantity
                                'cart.$.subTotal': product.price, // Update the subtotal
                            },
                        }
                    );
    
                } else {
                    // If the product is not in the cart, add it as a new entry
                    userData.cart.push({
                        ProductId: id,
                        quantity: 1,
                        total: product.price,
                        subTotal: product.price, // Initial subtotal is the same as the product price
                    });
    
                    await userData.save();
    
                }
            }
    
           res.json({status:true})

        }else{
            res.json({ status:false})
        }

        // Find the user by their ID
       
    } catch (error) {
        console.log('Error occurred in cart controller addToCart function', error);
        // Handle the error and possibly send an error response to the client
        // res.status(500).json({ error: 'Internal Server Error' });
    }
});

//------




//-------------------------------------------------------------------------------



//------------load cart----------------------------------------------------------


const displayCart = asyncHandler(async (req, res) => {
    //-------renderin the cart page --------------------

    try {
        const id = req.session.user
        const user = await User.findById(id)



        const productIds = user.cart.map(cartItem => cartItem.ProductId);


  
        const product = await Product.find({ _id: { $in: productIds } });

        const products=await Product.aggregate([{
            $match:{
                 _id: { $in: productIds },
               status:{$ne:false},
               'category.status': { $ne: false }
            }
         }])

        let totalSubTotal = 0;
        let quantity = 0;
        for (const item of user.cart) {
            totalSubTotal += item.subTotal;
            quantity += item.quantity
        }


        res.render('cart', { product, cart: user.cart, quantity, totalSubTotal, user });
    } catch (error) {
        console.log('Error Happence in cart controller loadCart function ', error);
    }
})

//-----------------------------------------------------------------------------------------------

//----------Dlt item from cart-------------------------------------------------------------------------


const dltItem = asyncHandler(async (req, res) => {
    try {
        const id = req.session.user
        const productId = req.body.id

        const userData = await User.findById(id)
        console.log(userData, 'this is the userdata in dltItem');

        if (userData) {
            const dltProduct = userData.cart.map(item => item.productId === productId)
            if (dltProduct) {
                console.log(dltProduct);
                userData.cart.splice(dltProduct, 1)
                await userData.save()
            }
        } else {

        }
        res.json({ status: true })

    } catch (error) {
        console.log(error, 'error while deleting cart item');
    }
})


//--------------------------------------------------------------------------------------------------------

//--------Dlt all elements in the cart------------------------------------

const dltAllCrtItm = asyncHandler(async (req, res) => {
    try {
        const userId = req.session.user
        const user = await User.findById(userId)

        user.cart = []
        const updatedUserData = await user.save()

        console.log(updatedUserData, 'this is the updated user details');

        res.json({ status: true })


    } catch (error) {
        console.log(error, 'error occur while Dlt all elements in the cart');
    }
})

//----------------------------------------------------------------------------------------------------------


//-----------------------------incriment value by clicking + icom-----------------------

const incrimentAjax = asyncHandler(async (req, res) => {
    try {
        const id = req.session.user
        const productId = req.body.id

        const product = Product.findById(productId)
        const userDetails = User.findById(id)

        if (userDetails) {
            const existingProduct = userDetails.cart.find(item => item.productId === productId)

            if (existingProduct) {

                const newQuantity = existingProduct.quantity + 1


                if (newQuantity > 0 && product.quantity >= newQuantity) {
                    const updated = await User.updateOne({ id: id, 'cart.productId': productId },
                        {
                            $inc: {

                                'cart.$.quantity': 1,


                            },
                            $set: {
                                'cart.$.subTotal': (product.price * (existingProduct.quantity + 1))

                            }


                        })
                    const updatedUser = await userDetails.save()

                    const totalAmount = product.price * (existingProduct.quantity + 1)

                    res.json({ status: true, quantityinput: existingProduct.quantity + 1, total: totalAmount })

                } else {
                    res.json({ status: false, error: "product out of stock" })
                }
            }

        }


    } catch (error) {
        console.log(error, 'the error occur while incriment the product');
        return res.status(500).json({ status: false, error: "Server error" });
    }
})
//----------------------------------------------------------------------------------------------------------------------------------

const decrimentAaxorg = asyncHandler(async (req, res) => {
    try {

        const id = req.body.productId

        const userId = req.session.user

        const userData = await User.findById(userId)

        const product = await Product.findById(id)

        if (userData) {
            const existingCartItem = await userData.cart.find(item => item.id === id)
            if (existingCartItem) {

                const update = await User.updateOne({
                    id: userId, 'cart.productId': id
                }, {
                    $inc: {
                        'cart.$.quantity': -1,

                    },
                    $set: {

                        'cart.$.subTotal': product.price * (existingCartItem - 1)
                    }
                })
                const updated = userData.save()

                const totalAmount = product.price * (existingCartItem.quantity - 1)
                res.json({ status: true, quantityinput: existingCartItem.quantity + 1, total: totalAmount })
            }
        }

    } catch (err) {
        console.error(error);
        return res.status(500).json({ status: false, error: "Server error" });
    }
})

//---------------------------------------------------------------------------------------------------------------------------------
const decrimentAjax = async (req, res) => {
    try {
        const id = req.body.productId;
        const userId = req.session.user;
        const userData = await User.findById(userId);

        if (userData) {
            const existingCartItem = userData.cart.find(item => item.productId === id);

            if (existingCartItem && existingCartItem.quantity > 0) {
                existingCartItem.quantity -= 1;
                existingCartItem.subTotal = product.price * existingCartItem.quantity;
                await userData.save();

                res.json({
                    status: true,
                    quantityInput: existingCartItem.quantity,
                    total: userData.cart.reduce((total, item) => total + item.subTotal, 0)
                });
            } else {
                res.json({ status: false, error: "Product not found in the cart or quantity is already 0." });
            }
        } else {
            res.json({ status: false, error: "User not found." });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, error: "Server error" });
    }
}


//-------------------------UPdate Crt------------------------------------------------------


const updateCart = asyncHandler(async (req, res) => {
    try {
        console.log(' entered to updatecart');

        const id = req.body.id;
        const userId = req.session.user;
        const count = req.body.count; // Added count parameter

        console.log('productid:', id, 'userid:', userId, 'productCount:', count, 'these are the data get reach in updatecart ');

        // Find the user by their ID
        const user = await User.findById(userId);
        const product = await Product.findById(id);
        console.log('user:', user, 'product:', product, 'reach in updatecart ');

        if (user) {

            const existingCartItem = user.cart.find(item => item.ProductId === id);

            if (existingCartItem) {
                let newQuantity;

                if (count == 1) {
                    console.log('entered to count == 1');

                    // Increment quantity
                    newQuantity = existingCartItem.quantity + 1;

                } else if (count == -1) {
                    console.log('entered to count == -1');
                    newQuantity = existingCartItem.quantity - 1;
                } else {

                    return res.status(400).json({ status: false, error: "Invalid count" });
                }

                // Check if the new quantity is within bounds (greater than 0 and not exceeding product quantity)
                if (newQuantity > 0 && newQuantity <= product.quantity) {
                    console.log('inside :(newQuantity > 0 && newQuantity <= product.quantity ');
                    const updated = await User.updateOne(
                        { _id: userId, 'cart.ProductId': id },
                        {
                            $set: {
                                'cart.$.quantity': newQuantity, // Update the quantity
                                'cart.$.subTotal': (product.price * newQuantity), // Update the subtotal
                            },
                        }
                    );


                    const updatedUser = await user.save();

                    const totalAmount = product.price * newQuantity;

                    res.json({ status: true, quantityInput: newQuantity, total: totalAmount });
                } else {


                    res.json({ status: false, error: 'out of stock' });
                }
            }
        }
    } catch (error) {
        console.error('ERROR hapence in cart ctrl in the funtion update crt', error);
        return res.status(500).json({ status: false, error: "Server error" });
    }
});


//----------------------------------------------------------------------------------------------------------


module.exports = {
    addToCart,
    displayCart,
    decrimentAjax,
    incrimentAjax,
    dltAllCrtItm,
    dltItem,
    updateCart
}