// Import necessary libraries
const sharp = require('sharp');

// Define the processAndStoreImage function
const processAndStoreImage = async (croppedImage) => {
  try {
    // Process the image (e.g., resize it)
    const processedImageBuffer = await sharp(croppedImage.buffer)
      .resize(300, 300) // Adjust the dimensions as needed
      .toBuffer();

    // Save the processed image to your storage system or server
    // You can use a library like multer.diskStorage or a cloud storage service for this

    // Return the URL of the processed image
    return '/path/to/processed/image'; // Replace with the actual URL
  } catch (error) {
    console.log(error);
    throw new Error('Image processing and storage failed');
  }
};

// Export the processAndStoreImage function
module.exports = processAndStoreImage;
