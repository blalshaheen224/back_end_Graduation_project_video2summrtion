const multer = require('multer');
const AppError = require('../utils/AppError');
const path = require('path');
const fs = require('fs');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');


const createCloudinaryStorage  = (folder) =>{
    return  new CloudinaryStorage({
        cloudinary,
        params :{
          folder,
          public_id: (req, file) => `${folder}-${Date.now()}`,
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        },
      });
}


const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith('image') &&
    ['.jpg', '.jpeg', '.png', '.webp'].includes(
      path.extname(file.originalname).toLowerCase()
    )
  ) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files are allowed', 400), false);
  }
};
const createUploader  = (folder) =>{
 return multer({
  storage : createCloudinaryStorage(folder),
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});
}







module.exports = {
  uploadProfile: createUploader('users'),
  uploadProduct: createUploader('products'),
    uploadCategory: createUploader('category')
};