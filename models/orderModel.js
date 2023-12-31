const mongoose = require('mongoose'); // Erase if already required
const { v4: uuidv4 } = require('uuid');
const mongoosePaginate = require('mongoose-paginate-v2');


// Declare the Schema of the Mongo model
var oderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        default: uuidv4,
        unique: true,
      },
    totalPrice: {
        required: true,
        type: Number
    },
   
    createdOn: {
        required: true,
        type: Date,
        default: Date.now
    },
    date: {
        required: true,
        type: String,

    },
    product: {
        required: true,
        type: Array
    },
    reason: {
        type: String,
        default: 0
    },
    userId: {
        required: true,
        type: String

    },
    payment: {
        required: true,
        type: String,
    },
    status: {
        required: true,
        type: String
    },
    address: {
        type: Array,
        required: true
    }

});


oderSchema.plugin(mongoosePaginate);


//Export the model
module.exports = mongoose.model('Oder', oderSchema);