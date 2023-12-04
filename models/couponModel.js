const mongoose = require('mongoose');

const mongoosePaginate = require('mongoose-paginate-v2');


const couponSchema= new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
    },
    Amount: {
        type: Number,
        required: true,
    },
    minimumAmount: {
        type: Number,
    },
    createdOn: {
        type: Date,
        default: Date.now,
    },
    expiryDate: {
        type: Date,
        required: true, 
    },
    user:{
        type:Array,
        userId:{
            type:String
        }
    }
});
module.exports= mongoose.model('coupon',couponSchema)