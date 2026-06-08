const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/catchAsync");
const jwt = require('jsonwebtoken');
const env = require('../config/env')
const user = require("../modules/users/user.model");

const auth_middleware =asyncHandler( async (req,res,next)=>{
    let token ;
   if(req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }
    if(!token) throw new AppError("Unauthorized",401);
   const decoded  = await jwt.verify(token,env.JWT_SECRET);
   const  User  = await user.findById(decoded.id) ;
   if(!User) throw new AppError("user no longer exits",401);
   req.user = User;
   next();
})





module.exports = auth_middleware 