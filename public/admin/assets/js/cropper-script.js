// let croppie;

// document.getElementById('images').addEventListener('change', (e) => {
//     const files = e.target.files;
//     if (files.length > 0) {
//         const reader = new FileReader();
//         reader.onload = function (event) {
//             document.getElementById('imageToCrop').src = event.target.result;

//             if (croppie) {
//                 croppie.destroy();
//             }

//             croppie = new Croppie(document.getElementById('imageToCrop'), {
//                 viewport: { width: 200, height: 200 }, // Set the desired cropping area size
//                 boundary: { width: 300, height: 300 }, // Set the boundary size
//             });
//         };
//         reader.readAsDataURL(files[0]);

//         const previewContainer = document.getElementById('imagePreview');
//         previewContainer.innerHTML = '';
//         for (const file of files) {
//             const reader = new FileReader();
//             reader.onload = function (e) {
//                 const img = document.createElement('img');
//                 img.src = e.target.result;
//                 img.classList.add('preview-image');
//                 previewContainer.appendChild(img);
//             };
//             reader.readAsDataURL(file);
//         }
//     }
// });

// function cropImage() {
//     croppie.result('base64').then((base64) => {
//         // You can now upload the cropped image (base64) or perform further actions with it.
//         console.log(base64);
//     });
// }



// cropper-script.js
// document.addEventListener('DOMContentLoaded', () => {
//     const image = document.getElementById('productImage');
//     const cropper = new Cropper(image, {
//       aspectRatio: 1, // Adjust the aspect ratio as needed
//       viewMode: 2, // Set to 2 for responsive mode
//     });
  
//     // Handle cropping and update hidden input field with cropped data
//     const cropButton = document.getElementById('cropButton');
//     cropButton.addEventListener('click', () => {
//       const canvas = cropper.getCroppedCanvas();
//       const croppedDataUrl = canvas.toDataURL('image/jpeg');
  
//       // Update a hidden input field with the cropped image data
//       const croppedImageInput = document.getElementById('croppedProductImage');
//       croppedImageInput.value = croppedDataUrl;
  
//       // Optionally, display the cropped image preview
//       const preview = document.getElementById('croppedImagePreview');
//       preview.src = croppedDataUrl;
//     });
//   });
  



// public/js/cropper-script.js
document.addEventListener('DOMContentLoaded', () => {
    const $images = $('#images');
    const $croppedCanvas = $('#croppedCanvas');
    const $croppedImages = $('#croppedImages');
    const $cropButton = $('#cropButton');
  
    $images.change(function () {
      $croppedCanvas.hide();
      $croppedImages.empty();
  
      $images.each(function () {
        const image = this;
        const cropper = new Cropper(image, {
          aspectRatio: 1,
          viewMode: 2,
        });
  
        $cropButton.click(function () {
          const croppedDataUrl = cropper.getCroppedCanvas().toDataURL();
          $croppedCanvas.attr('src', croppedDataUrl).show();
  
          // Append the cropped image data to the form for submission
          $('<input>').attr({
            type: 'hidden',
            name: 'croppedImages[]',
            value: croppedDataUrl,
          }).appendTo('form');
        });
      });
    });
  });
  