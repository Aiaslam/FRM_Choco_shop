const asyncHandler=require('express-async-handler')
const User=require('../models/userModel')
const Product=require('../models/productModel')
const Razorpay=require('razorpay')
const Coupon = require('../models/couponModel')


var instance = new Razorpay({ key_id:process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_SECRETKEY })





//---------------add money to wallet --------------------
// Initialize Razorpay with your API keys
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRETKEY,
});
//---------------------------------------------------------









// Modify your addMoneyWallet function
const addMoneyWallet = asyncHandler(async (req, res) => {
    try {
        console.log('entered toadd money to wallet');
        const amount = req.body.amount;
        console.log(amount,'amount');

        // Generate a unique order ID for each transaction
        const orderId = generateUniqueOrderId();
        const generatedOrder = await generateOrderRazorpay(orderId, amount);
       
        
       console.log('this is genmatrator the walet order',generateOrderRazorpay);
       console.log(' before res.json');
        res.json({razorpayOrder: generatedOrder,status:true})
        console.log('after res.json');
    
    } catch (error) {
       console.log('Error hapence in the wallet ctrl in the funtion  addMoneyWallet',error);
        res.status(500).json({ error: "Internal server error" });
    }
});





//-------------------genarating a orderid for razorpay--------------------------------------
function generateUniqueOrderId() {
  
    const timestamp = Date.now();
    const uniqueId = Math.random().toString(36).substring(2, 15);
    return `order_${timestamp}_${uniqueId}`;
}
//---------------------------------------------------------







//------------------making razorpay payment ---------------------------------------
const generateOrderRazorpay = (orderId, total) => {
    console.log('entered to generateorder razorpay');
    return new Promise((resolve, reject) => {
        const options = {
            amount: total * 100,  // amount in the smallest currency unit
            currency: "INR",
            receipt: String(orderId)
        };
        instance.orders.create(options, function (err, order) {
            if (err) {
                console.log("failed");
                console.log(err);
                reject(err);
            } else {
                console.log("Order Generated RazorPAY: " + JSON.stringify(order));
                resolve(order);
            }
        });
    })
}
///--------------------------------------------------ended the add money to wallet----------------------------










//-----------------------------------updtate that amount that monfgo razor[pay added]------------

const updateMongoWallet = asyncHandler(async (req, res) => {
    try {
        console.log('entered to updatemongo wallrt');
        const amount = parseFloat(req.body.amount); // Parse amount as a float

    //   console.log('this si the amount ;',amount);
        const userId = req.session.user;
    

        const user = await User.findByIdAndUpdate(userId, {
           $inc:{"wallet" : amount},
           $push:{
            "history":{
                amount:amount,
                status:"credit",
                timestamp:Date.now()
                
            }
           }
            
        }, { new: true });

        console.log('Updated user data:', user);

       if(user){
        res.json({status:true})

       }else{
        res.json({err:"user is not foundd"})
       }
   
    } catch (error) {
        console.log('Error happened in the wallet ctrl in the function updateMongoWallet', error);
        res.status(500).json({ message: 'An error occurred while updating the wallet', error });
    }
});






//----------------walet  transaction use the wallet =====
const sumWallet=asyncHandler(async(req,res)=>{
    try {
        console.log('entered to sumWallet');
        const coupon= await Coupon.find()
    
        const id = req.session.user
        console.log(id,'id in  sum wallet');
        const user = await User.findById(id)
        //   console.log(user.cart);
        const productIds = user.cart.map(cartItem => cartItem.ProductId);
        const product = await Product.find({ _id: { $in: productIds } });
        console.log(product,'product in sum wallet');
        const transaction = {
            amount: user.wallet ,
            status: "debit",
            timestamp: new Date(), // You can add a timestamp to the transaction
        };
        user.wallet=0
        console.log(user.wallet,'user.wallet after asigning to zero');
        user.history.push(transaction);
       
        let offer = 0;
        console.log(offer,'offer @ 171');
        console.log(product.length,'product.length');
        for(let j=0; j < product.length;j++ ){
            if(product[j].offerPrice){
                console.log(product[j].offerPrice,'product[j].offerPrice');
                offer+=product[j].offerPrice
            }
           
           
        }
             console.log(offer,'offer');        // Push the transaction into the user's history array
       


        await user.save()
        console.log('after saving user.save',user);
        let sum = req.query.sum 
        let total =  req.query.total
        console.log(sum,'sum next is rendering $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');
       
        res.render('checkOut',{user,total, product, sum ,coupon,offer,})
        console.log('after rendering checkout page');
        
    } catch (error) {
        console.log('Error happened in the wallet ctrl in the function sumWallet', error);
        
    }
})





//----------------------use full amount in wallet-and after that chose a paying methord ----------------------------------
const sumWalletBuynow= asyncHandler(async(req,res)=>{
    try {
        const coupon= await Coupon.find()
    
        const id = req.session.user
        const user = await User.findById(id)
        const product=await Product.findById(req.query.id)
        const offer=product.offerPrice
        console.log('this is product in buynow ',product);
        const transaction = {
            amount: user.wallet ,
            status: "debit",
            timestamp: new Date(), 
        };
        user.wallet=0
        user.history.push(transaction);

        await user.save()

        let offsum = req.query.sum
        console.log('this is sum>>>>',sum);
       
        res.render('buyNow', { user, product, offsum ,coupon,offer})
        

        
    } catch (error) {
        console.log('Error happened in the wallet ctrl in the function sumWalletBuynow', error);
        
    }
})









module.exports={
    addMoneyWallet,
    updateMongoWallet,
    sumWallet,
    sumWalletBuynow
   
}