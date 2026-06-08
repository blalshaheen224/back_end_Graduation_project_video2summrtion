const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/catchAsync");
const user = require("../modules/users/user.model");


const role_middleware = (...roles) => {
  return asyncHandler( async (req,res,next) => {
     if(!roles.includes(req.user.role)) throw new AppError('You do not have permission', 403);
     next();
  })

}

module.exports = role_middleware