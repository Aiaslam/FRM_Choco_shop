// Import necessary libraries
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs')
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });

// Define the processAndStoreImage function
const processAndStoreImage = async (croppedImage) => {
  try {
    console.log(croppedImage,'this is croppedImage in sharp');
    // Process the image (e.g., resize it)
    const processedImageBuffer = await sharp(croppedImage.buffer)
      .resize(300, 300) // Adjust the dimensions as needed
      .toBuffer();

    // Save the processed image to your storage system or server
    // You can use a library like multer.diskStorage or a cloud storage service for this

    return '/public/admin/assets/imgs/croppedImages/processed-image.jpg';
   
  } catch (error) {
    console.log(error);
    throw new Error('Image processing and storage failed');
  }
};

// Export the processAndStoreImage function
module.exports = processAndStoreImage;
