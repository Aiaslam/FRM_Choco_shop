const asyncHandler=require('express-async-handler');
// const Product = require('../models/productModel.js');
const mongoose = require('mongoose');
const Product = require('../models/productModel.js')
const Catogary=require('../models/catogaryModel.js');
const User=require('../models/userModel.js')
const category = require('../models/catogaryModel.js')




//------------serch in the header based on catogary  -------------------
const filterSearch=asyncHandler(async(req,res)=>{
    try {
       
     const categoryid= req.query.id
     console.log(categoryid,'categoryid');

     const product = await Product.find({
        $or: [
            { title: { $regex: new RegExp(req.body.search, 'i') } }, // Partial match
            { title: req.body.search } // Exact match
        ]
    });
        const categories =await Catogary.find()

        console.log(categories,'categories');

        console.log(product.length);
        let cat;
        if(product.length >0){
             cat=product[0].catogary
             const itemsperpage = 8;
             const currentpage = parseInt(req.query.page) || 1;
             const startindex = (currentpage - 1) * itemsperpage;
             const endindex = startindex + itemsperpage;
             const totalpages = Math.ceil(product.length / 8);
             const currentproduct = product.slice(startindex,endindex);
     
             const userId=req.session.user
             const user=await User.findById(userId)
             if(user){
                res.render('filter',{product:currentproduct, totalpages,currentpage,cat,user,categories})
             }else{
                res.render('filter',{product:currentproduct, totalpages,currentpage,cat,categories})
             }
     
             


        }else{
            const products=[]
            cat=""
            const itemsperpage = 8;
            const currentpage = parseInt(req.query.page) || 1;
            const startindex = (currentpage - 1) * itemsperpage;
            const endindex = startindex + itemsperpage;
            const totalpages = Math.ceil(products.length / 8);
            const currentproduct = products.slice(startindex,endindex);
            const userId=req.session.user
            const user=await User.findById(userId)
            
    
            if(user){
                res.render('filter',{product:currentproduct, totalpages,currentpage,cat,user,categories})
            }else{
                res.render('filter',{product:currentproduct, totalpages,currentpage,cat,categories})
            }
        }
       
        
       
        
    } catch (error) {
        console.log('Error happent in filter controller in filterSearch funttion',error);
    }
})
//-----------------------------------------

















//-------------filter by -price ------------------

const priceFilter=asyncHandler(async(req,res)=>{  
    try {
    console.log('inside price filter');
        const price = req.query.price;
        console.log(price,'price');
        const cat= req.query.cat
        console.log(cat,'cat');
        const maxPrice = req.query.maxPrice;
        console.log(maxPrice,'maxPrice')
        const product = await Product.find({ $and: [{ price: { $gte: price } }, { price: { $lte: maxPrice } },{catogary:cat}] });
        console.log(product,'product')
        const itemsperpage = 8;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(product.length / 8);
        const currentproduct = product.slice(startindex,endindex);
        const userId=req.session.user
        const user=await User.findById(userId)
        if(user){
            res.render('filter',{product:currentproduct, totalpages,currentpage,cat,user})
        }else{
            res.render('filter',{product:currentproduct, totalpages,currentpage,cat})
        }
       

        
    } catch (error) {
        console.log('Error happent in filter controller in pricefilter funttion',error);
        
    }
})
//-------------------------------------------------------














//-----------------------filter with catogary------------------

// const CatogaryFilter=asyncHandler(async(req,res)=>{
//     try {
//         const catogary = req.query.catogary;
//         console.log(catogary,'catogary in categiry filte');
//         // const product=await Product.find({Catogary:catogary})
//         const test = await Catogary.find({ name: catogary });


//         console.log(test,'this is test category');
//         const product = await Product.find({ category:catogary });

//         console.log(product,'product in categiry filter');
//         const cat=catogary
//         console.log(cat,'cat in categiry filter');
//         const itemsperpage = 8;
//         const currentpage = parseInt(req.query.page) || 1;
//         const startindex = (currentpage - 1) * itemsperpage;
//         const endindex = startindex + itemsperpage;
//         const totalpages = Math.ceil(product.length / 8);
//         const currentproduct = product.slice(startindex,endindex);
//         const userId=req.session.user
//         const user=await User.findById(userId)
//         if(user){
//             res.render('filter',{product:currentproduct, totalpages,currentpage,cat,user})

//         }else{
//             res.render('filter',{product:currentproduct, totalpages,currentpage,cat})

//         }
       

//     } catch (error) {
//         console.log('Error happent in filter controller in CatogaryFilter funttion',error);
        
//     }
// })
//------------------------------------------

const CatogaryFilter = asyncHandler(async (req, res) => {
    try {
        const catogary = req.query.catogary;
        console.log(catogary);

        const data = await Catogary.findOne({ name: catogary });
        
        console.log(data, 'data');

        if (data) {
            const catid = data._id;
            console.log(catid, 'catid');

            // Use mongoose.Types.ObjectId to create an ObjectId instance
            const products = await Product.find({ category: catid });
            const cat=catogary
        console.log(cat,'cat in categiry filter');
        const itemsperpage = 8;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(products.length / 8);
        const currentproduct = products.slice(startindex,endindex);
        const userId=req.session.user
        const user=await User.findById(userId)
        if(user){
            res.render('filter',{product:currentproduct, totalpages,currentpage,cat,user})

        }else{
            res.render('filter',{product:currentproduct, totalpages,currentpage,cat})

        }
            console.log(products, 'products');
        } else {
            console.log('Category not found');
        }

    } catch (error) {
        console.log(error);
    }
});





//--------------clear the fi;lter and show all the data-------------------
const clearFilter = asyncHandler(async(req,res)=>{
 try {
   
    const product=await Product.find()
    const cat =''
    const itemsperpage = 8;
    const currentpage = parseInt(req.query.page) || 1;
    const startindex = (currentpage - 1) * itemsperpage;
    const endindex = startindex + itemsperpage;
    const totalpages = Math.ceil(product.length / 8);
    const currentproduct = product.slice(startindex,endindex);
    const userId=req.session.user
        const user=await User.findById(userId)
        if(user){
            res.render('filter',{product:currentproduct, totalpages,currentpage,cat,user})

        }else{
            res.render('filter',{product:currentproduct, totalpages,currentpage,cat})

        }
   
    
    
 } catch (error) {
    console.log('Error happent in filter controller in clearFilter funttion',error);
    
 }
})

//---------------------------------------------









//---------------------sort by price-------------
const sortByPrice=asyncHandler(async(req,res)=>{

 
        try {
            const cat= req.query.cat
          const sort = req.query.sort;
          console.log(sort,">>>>>>>>>");
          let sortOrder
        if(sort=="lowToHigh"){
            sortOrder= 1
        }else{
            sortOrder=-1
        }
       
          console.log(sortOrder,">>>>>>>>>");
      
          let product = await Product.find({catogary:cat}).sort({ price: sortOrder });
          console.log(sortOrder,">>>>>>>>>");

          const itemsperpage = 8;
          const currentpage = parseInt(req.query.page) || 1;
          const startindex = (currentpage - 1) * itemsperpage;
          const endindex = startindex + itemsperpage;
          const totalpages = Math.ceil(product.length / 8);
          const currentproduct = product.slice(startindex,endindex);
         
          const userId=req.session.user
          const user=await User.findById(userId)
          if(user){
            res.render('filter', { product: currentproduct, totalpages, currentpage,cat ,user});
          }else{
            res.render('filter', { product: currentproduct, totalpages, currentpage,cat });
          }
         
        } catch (error) {
          console.log('Error happened in filter controller in sortByPrice function', error);
        }
      });


//----------------------------









    




module.exports={
    filterSearch,
    priceFilter,
    CatogaryFilter,
    clearFilter,
    sortByPrice
    
   
}