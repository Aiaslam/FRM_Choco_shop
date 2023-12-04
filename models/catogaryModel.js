const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const catogaryModel = new mongoose.Schema({

    image: {
        type: String,
        required: true,

    },
    croppedImageData: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,

    },
    status:{
        type:Boolean,  default:true
    },
    offerAmount:{
       type:Number
    },
    description: {
        type: String,
        required: true,

    },
    type: {
        type: String,
        required: true,

    },

    status: {
        type: Boolean,
        default: true
    }

});


catogaryModel.plugin(mongoosePaginate);


//Export the model
module.exports = mongoose.model('Catogary', catogaryModel);


