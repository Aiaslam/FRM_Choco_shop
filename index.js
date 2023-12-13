const mongoose=require('mongoose')
const session = require('express-session');
const  {dbConnect} = require('./config/connectDb')

dbConnect()

const port= process.env.Port || 3000


//------------Express----------------------

const express=require('express')

const app=express()

app.use(express.static('public'))

require('dotenv').config();


const mongodbSession=require('connect-mongodb-session')(session)
const store= new mongodbSession({
    uri:process.env.MONGO_URL,
    collection:"SessionDB",
})

app.use(session({
    secret:process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 72 * 60 * 60 * 1000, // Session expires in 72 hours
      httpOnly: true,
    },
    store:store
  })
);
//-------------user router----------------------

const userRouter= require('./routes/userRouter')

app.use('/',userRouter)

  
//--------------Admin router--------------------------

const adminRouter=require('./routes/adminRouter')

app.use('/admin',adminRouter)




app.listen(8080,()=>{
    console.log('server started on the port 8080 ')
})