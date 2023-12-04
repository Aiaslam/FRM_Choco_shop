// multer.js
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/admin/assets/imgs/cropedImages');
  },
  filename: (req, file, cb) => {
    req.session.filename = file.fieldname + '-' + Date.now() + '.jpg'
    console.log(req.session.filename);
    cb(null, req.session.filename);
  },
});

const uploadprd = multer({ storage: storage });

module.exports = uploadprd;
