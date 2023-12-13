const sessionSecretId = "mysitesecretId"
require('dotenv').config();
const mongoose = require('mongoose');
let MONGO_URL=process.env.MONGO_URL
const dbConnect = async () => {
    try {
        const mongoURI = MONGO_URL
        console.log('MongoDB URI:', mongoURI);

        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            ssl: true,
            tlsAllowInvalidCertificates: true,
        });
        
        console.log('db connected');
    } catch (error) {
        console.log('mongo db connection error', error);
    }
};

module.exports = { dbConnect};
  
