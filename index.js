const mongoose=require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/ecommercedb')

const port= process.env.Port || 3000


//------------Express----------------------

const express=require('express')

const app=express()

app.use(express.static('public'))

require('dotenv').config();
//-------------user router----------------------

const userRouter= require('./routes/userRouter')

app.use('/',userRouter)

  
//--------------Admin router--------------------------

const adminRouter=require('./routes/adminRouter')

app.use('/admin',adminRouter)




app.listen(8080,()=>{
    console.log('server started on the port 8080 ')
})