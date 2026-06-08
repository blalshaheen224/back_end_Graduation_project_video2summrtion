require('dotenv').config();


module.exports = {
    dbUrl : process.env.MONGO_URL,
    PORT : process.env.PORT,
    JWT_SECRET : process.env.JWT_SECRET,
    JWT_SECRET_REFRESH : process.env.JWT_SECRET_REFRESH,
    JWT_EXPIRES_IN : process.env.JWT_EXPIRES_IN,
    JWT_EXPIRES_IN_REFRESH : process.env.JWT_EXPIRES_IN_REFRESH,
    NODE_ENV : process.env.NODE_ENV,
    CLOUDINARY_CLOUD_NAME : process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY : process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET : process.env.CLOUDINARY_API_SECRET,
}


