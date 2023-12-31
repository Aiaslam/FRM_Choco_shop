const User = require('../models/userModel')
const Product = require('../models/productModel')
const Razorpay = require('razorpay')
const asyncHandler = require('express-async-handler');
const Coupon = require('../models/couponModel')
const ExcelJS = require('exceljs');
const Oder = require('../models/orderModel')
var instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_SECRETKEY })
const mongoose = require('mongoose');



//----------Ceck Out ------------------------------------------------------------------------

const checkout = asyncHandler(async (req, res) => {
    try {
        const id = req.session.user
        const user = await User.findById(id)

        // const user = await User.findById(id)
        // const coupon = await Coupon.find({
        //     'user.userId': { $ne: user._id }
        // });
        // console.log('Valid coupons:', coupon);


        const productIds = user.cart.map(cartItem => cartItem.ProductId);
        const product = await Product.find({ _id: { $in: productIds } });
        
        let offer = 0;
        for(let j=0; j < product.length;j++ ){
            offer+=product[j].offerPrice
           
        }

        let couponprice=0

        let sum = 0;
        for (let i = 0; i < user.cart.length; i++) {
            sum += user.cart[i].subTotal
        }
        sum = Math.round(sum * 100) / 100;

        const coupon = await Coupon.find({
            'user.userId': { $ne: user._id },
            
        });
             
        let total=sum
        res.render('checkOut', { user, product, sum ,coupon,offer,couponprice,total})

    } catch (error) {
        console.log('Error form oder Ctrl in the function chekOut', error);
    }
})

// const checkout = asyncHandler(async (req, res) => {
//     try {
//         const id = req.session.user;
//         const user = await User.findById(id);

//         const productIds = user.cart.map(cartItem => cartItem.ProductId);

//         const product = await Product.aggregate([
//             {
//                 $match: {
//                     _id: { $in: productIds.map(productId => mongoose.Types.ObjectId(productId)) }
//                 }
//             },
//             {
//                 $project: {
//                     title: 1,
//                     description: 1,
//                     price: 1,
//                     category: 1,
//                     quantity: 1,
//                     images: 1,
//                     croppedImageData: 1,
//                 }
//             }
//         ]);

//         let sum = 0;
//         for (let i = 0; i < user.cart.length; i++) {
//             sum += user.cart[i].subTotal;
//         }
//         sum = Math.round(sum * 100) / 100;
//         res.render('checkOut', { user, product, sum });

//     } catch (error) {
//         console.log('Error from order controller in the function checkOut', error);
//     }
// });


//---------------------------------------------------------------------------------------




//-----------------------oderplaced-----------------------------
const oderPlaced = asyncHandler(async (req, res) => {
    try {

        const { totalPrice, createdOn, date, payment, addressId } = req.body
        console.log(totalPrice, createdOn, date, payment, addressId ,'totalPrice, createdOn, date, payment, addressId ');

        const id = req.session.user

        console.log(id,'id');
        const user = await User.findById(id);
        console.log(user,'user');
        const productIds = user.cart.map(cartItem => cartItem.ProductId);
        console.log(productIds,'productIds');




        const address = user.address.find(item => item._id.toString() === addressId);


        const productDetails = await Product.find({ _id: { $in: productIds } });

        const cartItemQuantities = user.cart.map(cartItem => ({
            ProductId: cartItem.ProductId,
            quantity: cartItem.quantity,
            price: cartItem.price, // Add the price of each product
        }));



        const orderProducts = productDetails.map(product => ({
            ProductId: product._id,
            price: product.price,
            title: product.title,
            image: product.images[0],
            quantity: cartItemQuantities.find(item => item.ProductId.toString() === product._id.toString()).quantity,
        }));




        // console.log('this the produxt that user by ',orderProducts);

        const oder = new Oder({
            totalPrice: totalPrice,
            createdOn: createdOn,
            date: date,
            product: orderProducts,
            userId: id,
            payment: payment,
            address: address,
            status: 'conformed'

        })
        const oderDb = await oder.save()
        //-----------part that dicrese the qunatity od the cutent product --
        for (const orderedProduct of orderProducts) {
            const product = await Product.findById(orderedProduct.ProductId);
            if (product) {
                const newQuantity = product.quantity - orderedProduct.quantity;
                product.quantity = Math.max(newQuantity, 0);
                await product.save();
            }
        }
        //-------------------------------  
        console.log('helllo');
        if (oder.payment == 'cod') {
            console.log('yes iam the cod methord');
            res.json({ payment: true, method: "cod", order: oderDb, qty: cartItemQuantities, oderId: user });

        } else if (oder.payment == 'online') {
            console.log('entered to oder.payment==online');
            const generatedOder = await generateOrderRazorpay(oderDb._id, oderDb.totalPrice)
            console.log(generatedOder, 'this is generatedOder next is res.json');
            res.json({ payment: false, method: "online", razorpayOrder: generatedOder, order: oderDb, oderId: user, qty: 1 })
        }else if(oder.payment=='wallet'){
            const a=user.wallet-=totalPrice;
            const transaction={
                amount :a,
                status:"debit",
                timestamp:new Date(),
            }
            user.history.push(transaction)

            await user.save()
            res.json({payment:true,method:"wallet"})
        }




    } catch (error) {
        console.log('Error form oder Ctrl in the function oderPlaced', error);

    }
})
//----------------------------------------------


//---------Razorpay-generateOrder-------------------

const generateOrderRazorpay = (orderId, total) => {
    console.log('in the funtion of genarateOrderrazorpay');
    return new Promise((resolve, reject) => {
        const options = {
            amount: total * 100,
            currency: "INR",
            receipt: String(orderId)
        }
        instance.orders.create(options, function (err, order) {
            if (err) {
                console.log("Failed to create order");
                console.log(err);
                reject(err)
            } else {
                console.log("Order Generated RazorPAY: " + JSON.stringify(order));
                resolve(order)
            }
        }
        )

    })
}



const allOderData = asyncHandler(async (req, res) => {
    try {
        const userId = req.session.user;
        const user = await User.findById(userId)
        const orders = await Oder.find({ userId: userId }).sort({ createdOn: -1 });





        const itemsperpage = 3;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(orders.length / 3);
        const currentproduct = orders.slice(startindex, endindex);


        res.render('oderList', { orders: currentproduct, totalpages, currentpage, user });
    } catch (error) {
        console.log('Error from oderCtrl in the function allOderData', error);
        res.status(500).json({ status: false, error: 'Server error' });
    }
});



const oderDetails = asyncHandler(async (req, res) => {
    try {
        const orderId = req.query.orderId
        // console.log('this is oder id ',orderId);
        // const  id=req.query.id.toString()


        const userId = req.session.user;
        const user = await User.findById(userId);
        const order = await Oder.findById(orderId)

        //    console.log('thid id the odder',order);

        res.render('oderDetails', { order, user });

    } catch (error) {
        console.log('errro happemce in cart ctrl in function oderDetails', error);

    }
})
const canselOder = asyncHandler(async (req, res) => {
    try {
        const userId = req.session.user;
        const user = await User.findOne({ _id: userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const orderId = req.query.orderId;
        const order = await Oder.findByIdAndUpdate(orderId, {
            status: 'canceled'
        }, { new: true });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }



        for (const productData of order.product) {
            const productId = productData.ProductId;
            const quantity = productData.quantity;

            const product = await Product.findById(productId);

            if (product) {
                product.quantity += quantity;
                await product.save();
            }
        }

        res.redirect('/allOderData');
    } catch (error) {
        console.log('Error occurred in cart ctrl in function canselOrder', error);

        res.status(500).json({ message: 'Internal Server Error' });
    }
});





//--cansel single order--------------------------------

    const canselSingleOrder = asyncHandler(async (req, res) => {
        try {console.log('entered to find cancel single orde');
            const ObjectId = mongoose.Types.ObjectId;
            const userId = req.session.user;
             console.log(userId,'userId');
            const user = await User.findOne({ _id: userId });
            console.log(user,'user');
    
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
    
            const orderId = req.query.orderId;
            console.log(orderId,'orderId');
            const productIdToCancel = req.query.productId; 
            

            // Add productId parameter
            console.log('this is .....',productIdToCancel,'...productIdToCancel');
            // checking purpose only--------------------------------------------------------------------------------------------------------------------------------------------------------------------
               let productDetails = await Product.findById(productIdToCancel)

                console.log("this is the produt that is going to delete ***************************",productDetails,"*****************************************");
            //------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
            const order = await Oder.findById(orderId);
            console.log(order,'order');
    
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }
    
            const isValidObjectId = mongoose.Types.ObjectId.isValid(productIdToCancel);
            let convertedProductId;
if (isValidObjectId) {
  convertedProductId = new ObjectId(productIdToCancel);
  console.log("convertedProductId",convertedProductId);
} else {
  console.error('Invalid ObjectId:', productIdToCancel);
}
             let products=order.product
             console.log("products(order array)=",products);
            const indexToDelete = products.findIndex(product => product.ProductId === convertedProductId);
           console.log(indexToDelete,"indexToDelete");

            if (indexToDelete !== -1) {
                products.splice(indexToDelete, 1);
                console.log(`Product with ID ${productIdToCancel} deleted successfully.`);
              } else {
                console.log(`Product with ID ${productIdToCancel} not found.`);
              }
              
              console.log(products);

            await order.save();
       console.log(order,'order after save');
            res.redirect('/allOderData');
        } catch (error) {
            console.log('Error occurred in order ctrl in function cancelOrder', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    });
    

//--------------------------------------------------------------


const orderListing = asyncHandler(async (req, res) => {
    try {
        const orders = await Oder.find().sort({ createdOn: -1 });
        // console.log('this is orders',orders);
        const itemsperpage = 3;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(orders.length / 3);
        const currentproduct = orders.slice(startindex, endindex);


        res.render('oderList', { orders: currentproduct, totalpages, currentpage })

    } catch (error) {
        console.log('errro happemce in cart ctrl in function orderListing', error);

    }
})
//----------------------------------------------------------------------






////------------------order detail foradmin------------------------
const oderDetailsAdmin = asyncHandler(async (req, res) => {
    try {
        const orderId = req.query.orderId



        const order = await Oder.findById(orderId)
        const userId = order.userId


        const user = await User.findById(userId)
            ;

        res.render('aOrderDetail', { order, user });

    } catch (error) {
        console.log('errro happemce in cart ctrl in function oderDetails', error);

    }
})
//-----------------------------------------------------------------------------






//-------------------admin change the user orde status --------------------
//---------------------------------------------------------------
const changeStatusPending = asyncHandler(async (req, res) => {
    try {
        console.log('this is req.query.orderId:', req.query.orderId);
        const orderId = req.query.orderId
        const order = await Oder.findByIdAndUpdate(orderId, {
            status: 'pending'
        }, { new: true })

        if (order) {
            res.json({ status: true })
        }

    } catch (error) {
        console.log('errro happemce in cart ctrl in function changeStatusPending', error);

    }
})
//------------------------------------------------------------------------





//---------------------------------------------------------------
const changeStatusConfirmed = asyncHandler(async (req, res) => {
    try {
        const orderId = req.query.orderId
        const order = await Oder.findByIdAndUpdate(orderId, {
            status: 'conformed'
        }, { new: true })
        if (order) {
            res.json({ status: true })
        }

    } catch (error) {
        console.log('errro happemce in cart ctrl in function changeStatusConfirmed', error);

    }
})
//------------------------------------------------------------------------






//---------------------------------------------------------------
const changeStatusShipped = asyncHandler(async (req, res) => {
    try {
        const orderId = req.query.orderId
        const order = await Oder.findByIdAndUpdate(orderId, {
            status: 'shipped'
        }, { new: true })
        if (order) {
            res.json({ status: true })
        }
    } catch (error) {
        console.log('errro happemce in cart ctrl in function changeStatusShipped', error);

    }
})
//------------------------------------------------------------------------






//---------------------------------------------------------------
const changeStatusDelivered = asyncHandler(async (req, res) => {
    try {
        const orderId = req.query.orderId
        const order = await Oder.findByIdAndUpdate(orderId, {
            status: 'delivered'
        }, { new: true })
        if (order) {
            res.json({ status: true })
        }

    } catch (error) {
        console.log('errro happemce in cart ctrl in function changeStatusDelivered', error);

    }
})
//------------------------------------------------------------------------






//---------------------------------------------------------------
const changeStatusreturned = asyncHandler(async (req, res) => {
    try {
        const orderId = req.query.orderId
        const order = await Oder.findByIdAndUpdate(orderId, {
            status: 'returned'
        }, { new: true })
        if (order) {
            res.json({ status: true })
        }

    } catch (error) {
        console.log('errro happemce in cart ctrl in function changeStatusreturned', error);

    }
})
//------------------------------------------------------------------------






//---------------------------------------------------------------
const changeStatusCanseled = asyncHandler(async (req, res) => {
    try {
        const orderId = req.query.orderId
        const order = await Oder.findByIdAndUpdate(orderId, {
            status: 'canceled'
        }, { new: true })
        if (order) {
            res.json({ status: true })
        }

    } catch (error) {
        console.log('errro happemce in cart ctrl in function changeStatusCanseled', error);

    }
})

//--------------------------------------------------------------------

const verifyPayment = asyncHandler(async (req, res) => {
    try {

        verifyOrderPayment(req.body)
        res.json({ status: true });

    } catch (error) {
        console.log('errro happemce in cart ctrl in function verifyPayment', error);

    }
})
//----------------------------------------------





//---------------verify the payment  razorpay-------------------------------

const verifyOrderPayment = (details) => {
    console.log("DETAILS : " + JSON.stringify(details));
    return new Promise((resolve, reject) => {
        const crypto = require('crypto');
        let hmac = crypto.createHmac('sha256', process.env.RAZORPAY_SECRETKEY)
        hmac.update(details.razorpay_order_id + '|' + details.razorpay_payment_id);
        hmac = hmac.digest('hex');
        if (hmac == details.razorpay_signature) {
            console.log("Verify SUCCESS");
            resolve();
        } else {
            console.log("Verify FAILED");
            reject();
        }
    })
};


//----------------------------------------------------------------------------------------------------


const loadSalesReport = asyncHandler(async (req, res) => {
    try {

        const orders = await Oder.find({ status: 'delivered' })

        const itemsperpage = 4
        const currentpage = parseInt(req.query.page) || 1;
        const startIndex = (currentpage - 1) * itemsperpage
        const endIndex = startIndex + itemsperpage
        const totalpages = Math.ceil(orders.length / 3)
        const currentproduct = orders.slice(startIndex, endIndex)
        res.render('salesReport', { orders: currentproduct, totalpages, currentpage })
    } catch (error) {
        console.log(error);
    }
})

const loadCanceledSalesReport = asyncHandler(async (req, res) => {
    try {

        const orders = await Oder.find({ status: 'canceled' })

        const itemsperpage = 4
        const currentpage = parseInt(req.query.page) || 1;
        const startIndex = (currentpage - 1) * itemsperpage
        const endIndex = startIndex + itemsperpage
        const totalpages = Math.ceil(orders.length / 3)
        const currentproduct = orders.slice(startIndex, endIndex)
        res.render('canceledsalesReport', { orders: currentproduct, totalpages, currentpage })
    } catch (error) {
        console.log(error);
    }
})

const salesReport = asyncHandler(async (req, res) => {
    try {
        const date = req.query.date;
         const format = req.query.format;
        let orders;
        const currentDate = new Date();
        // function to find first day of month
        function getFirstOfMonth(date) {
            return new Date(date.getFullYear(), date.getMonth(), 1)
        }

        function getFirstDayofYear(date) {
            return new Date(date.getFullYear(), 0, 1)
        }


        switch (date) {
            case 'today':
                orders = await Oder.find({
                    status: 'delivered',
                    createdOn: {
                        $gte: new Date().setHours(0, 0, 0, 0),
                        $lt: new Date().setHours(23, 59, 59, 999)
                    },
                })
                break
            case 'week':
                const startofWeek = new Date(currentDate)
                startofWeek.setDate(currentDate.getDate() - currentDate.getDay())
                startofWeek.setHours(0, 0, 0, 0)

                const endOfWeek = new Date(startofWeek)
                endOfWeek.setDate(startofWeek.getDate() + 6)
                endOfWeek.setHours(23, 59, 59, 999);

                orders = await Oder.find({
                    status: 'delivered',
                    createdOn: {
                        $gte: startofWeek,
                        $lt: endOfWeek,

                    },
                })
                break;

            case 'month':
                const startOfMonth = getFirstOfMonth(currentDate);
                const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);

                orders = await Oder.find({
                    status: 'delivered',
                    createdOn: {
                        $gte: startOfMonth,
                        $lt: endOfMonth,
                    },
                });
                break;
            case 'year':
                const startOfYear = getFirstDayofYear(currentDate);
                const endOfYear = new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59, 999);

                orders = await Oder.find({
                    status: 'delivered',
                    createdOn: {
                        $gte: startOfYear,
                        $lt: endOfYear,
                    },
                });

                break;
            default:
                // Fetch all orders
                orders = await Oder.find({ status: 'delivered' });
        }
        if (format === 'excel') {
            // Generate Excel file
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sales Report');

            worksheet.columns = [
                { header: 'Order ID', key: 'id', width: 30 },
                { header: 'Product name', key: 'name', width: 30 },
                { header: 'Price', key: 'price', width: 15 },
                { header: 'Status', key: 'status', width: 20 },
                { header: 'Date', key: 'date', width: 15 }
                // ... Add more columns as needed
            ];

            // Add data to the worksheet
            orders.forEach(order => {
                order.product.forEach(product => {
                    worksheet.addRow({
                        id: order._id,
                        name: product.title,
                        price: order.totalPrice,
                        status: order.status,
                        date: order.createdOn.toLocaleDateString()
                        // ... (Fill other columns as necessary)
                    });
                });
            });

            // Set response headers for Excel file
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=sales-report.xlsx');

            // Pipe the workbook to the response
            await workbook.xlsx.write(res);
            return res.end();
        } else {

        const itemsperpage = 3;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(orders.length / 3);
        const currentproduct = orders.slice(startindex, endindex);

        res.render('salesReport', { orders: currentproduct, totalpages, currentpage })
        }
    } catch (error) {
        console.log(error);
    }
})




const CanceledsalesReport = asyncHandler(async (req, res) => {
    try {
        const date = req.query.date;
         const format = req.query.format;
        let orders;
        const currentDate = new Date();
        // function to find first day of month
        function getFirstOfMonth(date) {
            return new Date(date.getFullYear(), date.getMonth(), 1)
        }

        function getFirstDayofYear(date) {
            return new Date(date.getFullYear(), 0, 1)
        }


        switch (date) {
            case 'today':
                orders = await Oder.find({
                    status: 'canceled',
                    createdOn: {
                        $gte: new Date().setHours(0, 0, 0, 0),
                        $lt: new Date().setHours(23, 59, 59, 999)
                    },
                })
                break
            case 'week':
                const startofWeek = new Date(currentDate)
                startofWeek.setDate(currentDate.getDate() - currentDate.getDay())
                startofWeek.setHours(0, 0, 0, 0)

                const endOfWeek = new Date(startofWeek)
                endOfWeek.setDate(startofWeek.getDate() + 6)
                endOfWeek.setHours(23, 59, 59, 999);

                orders = await Oder.find({
                    status: 'canceled',
                    createdOn: {
                        $gte: startofWeek,
                        $lt: endOfWeek,

                    },
                })
                break;

            case 'month':
                const startOfMonth = getFirstOfMonth(currentDate);
                const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);

                orders = await Oder.find({
                    status: 'canceled',
                    createdOn: {
                        $gte: startOfMonth,
                        $lt: endOfMonth,
                    },
                });
                break;
            case 'year':
                const startOfYear = getFirstDayofYear(currentDate);
                const endOfYear = new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59, 999);

                orders = await Oder.find({
                    status: 'canceled',
                    createdOn: {
                        $gte: startOfYear,
                        $lt: endOfYear,
                    },
                });

                break;
            default:
                // Fetch all orders
                orders = await Oder.find({ status: 'canceled' });
        }
        if (format === 'excel') {
            // Generate Excel file
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sales Report');

            worksheet.columns = [
                { header: 'Order ID', key: 'id', width: 30 },
                { header: 'Product name', key: 'name', width: 30 },
                { header: 'Price', key: 'price', width: 15 },
                { header: 'Status', key: 'status', width: 20 },
                { header: 'Date', key: 'date', width: 15 }
                // ... Add more columns as needed
            ];

            // Add data to the worksheet
            orders.forEach(order => {
                order.product.forEach(product => {
                    worksheet.addRow({
                        id: order._id,
                        name: product.title,
                        price: order.totalPrice,
                        status: order.status,
                        date: order.createdOn.toLocaleDateString()
                        // ... (Fill other columns as necessary)
                    });
                });
            });

            // Set response headers for Excel file
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=sales-report.xlsx');

            // Pipe the workbook to the response
            await workbook.xlsx.write(res);
            return res.end();
        } else {

        const itemsperpage = 3;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(orders.length / 3);
        const currentproduct = orders.slice(startindex, endindex);

        res.render('canceledsalesReport', { orders: currentproduct, totalpages, currentpage })
        }
    } catch (error) {
        console.log(error);
    }
})


//---------------------------------------
const orderdtl=asyncHandler(async(req,res)=>{
    try{
        const orderId = req.query.orderId
        // console.log('this is oder id ',orderId);
        // const  id=req.query.id.toString()


        const userId = req.session.user;
        const user = await User.findById(userId);
        const order = await Oder.findById(orderId)

        //    console.log('thid id the odder',order);

        res.render('orderDtls', { order, user });
    }catch(err){
        console.log(err,'error');
    }
})


//-----------------------------------------
const useWallet=asyncHandler(async(req,res)=>{
    try {
         console.log('now it is inside the use wallet');
        const userId=req.session.user;
        console.log(userId,'userId i n use wallet');
        const user=await User.findById(userId)
        console.log(user,'this is the user find with user id in uswewallet');

        if(user){
            console.log('now it is inside the user ');
            let a=req.body
           console.log(a,'this is the req,body inside usewallet');
           console.log(a.total ,'this is the a.total  inside usewallet');

           console.log(a.wallet ,'this is the a.wallet  inside usewallet');

            let sum= a.total - a.wallet
            let total=a.total
            console.log(sum ,'this is the sum (a.total - a.wallet) inside usewallet and next is json responce')
           
            res.json({ status: true, sum ,total});

        } 
    } catch (error) {
        console.log('errro happemce in cart ctrl in function useWallet',error); 
        
    }
})


//------------------------------returnnorder----------------------------
const returnOrder = asyncHandler(async (req, res) => {
    try {
      const orderId = req.query.orderId;
      const userId = req.session.user;
  
   
      const user = await User.findOne({ _id: userId });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const order = await Oder.findByIdAndUpdate(orderId, {
        status:'returned'
      }, { new: true });
  
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      user.wallet += order.totalPrice;


      const transaction = {
        amount: user.wallet ,
        status: "credit",
        timestamp: new Date(), // You can add a timestamp to the transaction
    };
    
    user.history.push(transaction);
      await user.save();
  
      for (const productData of order.product) {
        const productId = productData.ProductId;
        const quantity = productData.quantity;
  
        // Find the corresponding product in the database
        const product = await Product.findById(productId);
  
        if (product) {
          product.quantity += quantity;
          await product.save();
        }
      }
  
      res.redirect('/allOderData');
    } catch (error) {
      console.log('Error occurred in returnOrder function:', error);
     
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  //---------------------------------------------

//







//---------------------------------------------------------------------------------------------------------

module.exports = {
    checkout,
    oderPlaced,
    allOderData,
    oderDetails,
    canselOder,
    orderListing,
    oderDetailsAdmin,
    changeStatusPending,
    changeStatusConfirmed,
    changeStatusShipped,
    changeStatusDelivered,
    changeStatusreturned,
    changeStatusCanseled,
    loadSalesReport,
    salesReport,
    verifyPayment,
    canselSingleOrder,
    orderdtl,
    useWallet,
    returnOrder,
    CanceledsalesReport,
    loadCanceledSalesReport
    

}
