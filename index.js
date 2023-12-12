const mongoose=require('mongoose')

const mongoURI ='mongodb+srv://aliaslamnoushad:ANxtp1jbMSLVMt8J@frm.g0po99q.mongodb.net/?retryWrites=true&w=majority'
mongoose.connect(mongoURI).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});
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