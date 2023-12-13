const mongoose = require('mongoose');
var bcrypt = require('bcrypt');

const mongoosePaginate = require('mongoose-paginate-v2');
const addressSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    mobile: {
        type: Number,
        required: true,
    },
    region: {
        type: String,
        required: true,
    },
    pinCode: {
        type: Number,
        required: true,
    },
    addressLine: {
        type: String,
        required: true,
    },
    areaStreet: {
        type: String,
        required: true,
    },
    ladmark: {
        type: String,
        required: true,
    },
    townCity: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    adressType: {
        type: String,
        default: "Home"
    },
    main: {
        type: Boolean,
        default: false,
    },
});


const userModel = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        requird: true
    },

    is_admin: {
        type: Number,
        default: 0
    },

    mobile: {
        type: Number,
        required: true,
        unique: true,
    },

    isBlocked: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    address: [addressSchema],
    cart: {
        type: Array,
        ProductId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Product"
        },
        quantity: {
            type: Number,
            required: true,
        },
        total: {
            type: Number,
            required: true
        },
        subTotal: {
            type: Number,

        }
    },
    wallet: {
       
        type:Number,
        default:0,
        required:true
       
        
    },
    wishlist: {
        type: Array,
        ProductId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Product"
        }
    },
    history: {
        type:Array,
        amount: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default:Date.now,
            
        }
    },

})

userModel.methods.isPasswordMatched = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userModel.plugin(mongoosePaginate);
;

module.exports = mongoose.model('User', userModel);