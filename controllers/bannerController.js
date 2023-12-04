const Banner = require ('../models/bannerModel')
const asyncHandler=require('express-async-handler')

///-------------------------rendering baner-----------------------------
const banner=asyncHandler(async(req,res)=>{
    try {
        const banner= await Banner.find()


        const itemsperpage = 2;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(banner.length / 2);
        const currentproduct = banner.slice(startindex,endindex);
        res.render('displayBanner',{banner:currentproduct,totalpages,currentpage,})
        
    } catch (error) {
        console.log('Error from the banner ctrl in the funtion banner',error);
    }
})
//-------------------------------------------------------------------


//----addBanner-------------------------

const addBanner= asyncHandler(async(req,res)=>{
    try{
        console.log('entered to add banner');
        res.render('addBanner')

    }catch(error){
        console.log(error);
    }
})
//----------------------------------------------

//creating Banner----------------

const createBanner= asyncHandler(async(req,res)=>{
    try{
        const bannerTitle = req.body.title;
     const titleRegex = new RegExp(bannerTitle, 'i');      
     const existingBanner = await Banner.findOne({ title: { $regex: titleRegex } });
 
     if (existingBanner) {
       console.log('Banner already exists:', existingBanner.title);
       const errorMessage = "Banner already exists";
       return res.redirect(`/admin/add-Banner?error=${encodeURIComponent(errorMessage)}`);
     }else{
        const {title,discription,link}= req.body
        console.log(title,discription,link,'title,discription,link'); 
        const newBannner= new Banner({
        image:req.file.filename,
          title:title,
          discription:discription,
          date:Date.now(),
          link:link

        })
       const savedBanner= newBannner.save()
       console.log(savedBanner);

  res.redirect('/admin/display-Banner')
     }
        
    }catch(error){
      console.log(error);
    }
})


// rendering page to edit banner--------------------------
const editBanner= asyncHandler(async(req,res)=>{
    try{
        const bannedId= req.query.id
        console.log(bannedId,'bannedId');
        const bannerData= await Banner.findById(bannedId)
        console.log(bannerData,'bannerData');
        if(bannerData){
            console.log('in side if(bannnerdata');
            res.render('editBanner',{banner:bannerData})
        }else{
            console.log('oops!! banner not Found');
        }

    }catch(error){
        console.log(error);
    }
})


// updating Banner data------------

const updateBannerData= asyncHandler(async(req,res)=>{
    try{
        const title = req.body.title
      const discription = req.body.discription
      const link = req.body.link
      const id= req.body.id
      const img = req.file ? req.file.filename : null; 
      console.log(id);
      const existingBanner = Banner.findById(id)
      if (!existingBanner) {
         console.log('already not exist so passing error message');
         let errMessage = 'Banner not found'
         return res.redirect(`/admin/edit-Banner?error=${encodeURIComponent(errMessage)}`);
      } else {
        if(img){
            const update = await Banner.findByIdAndUpdate(id,{
                title:title,
                discription:discription,
                link:link,
                image:req.file.filename
                
            })
            console.log(update),
                res.redirect('/admin/display-Banner')
        }else{
            const update= await Banner.findByIdAndUpdate(id,{
                title,
                discription,
                link,
        })
        console.log(update);
        res.redirect('/admin/display-Banner')
        }
        
        

      }

    }catch(ERROR){
        console.log(ERROR)
    }
})

// deleting banner-----------
const dltBanner= asyncHandler(async(req,res)=>{
    try{
     const id=req.query.id
     console.log(id,'id from inside');
     const dlt= await Banner.findByIdAndDelete(id)
     console.log(dlt);
   
    }catch(error){
        console.log(error);
    }
})

module.exports={
    dltBanner,
    updateBannerData,
    editBanner,
    createBanner,
    addBanner,
    banner





}