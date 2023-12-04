const mongoose = require('mongoose');

const mongoosePaginate = require('mongoose-paginate-v2');
const productModel = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },

  description: { // Fixed field name 
    type: String,
    required: true
  },

  price: {
    type: Number,
    required: true
  },
  offerPrice:{
    type:Number,
},

  category: { // Fixed field name
    type: String,
    required: false
  },
  savedPrice:{
    type:Number,
},
  quantity: {
    type: Number,
    default: 0
  },
  rating: {
    type:Object,
    average: {
        type:Number,
    }, 
    totalRatings: {
        type:Number
    },
    default: {
        average: 0,       
        totalRatings: 0,  
},
},
individualRatings: {
    type:Array,
    star: {
        type:Number,
    }, 
    review: {
        type:String,
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
    },
},
  status:{
    type:Boolean,
    default:true
},


  images: [{ type: String }],
  croppedImageData: {
    type: Array,
    required: true,
  },
}, { timestamps: true });


productModel.plugin(mongoosePaginate);
// Export the model
module.exports = mongoose.model('Product', productModel);
