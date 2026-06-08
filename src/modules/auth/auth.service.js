const AppError = require("../../utils/AppError")
const asyncHandler = require("../../utils/catchAsync")
const user = require("../../modules/users/user.model")
const {signToken , refreshSignToken} =require("../../utils/jwt")
const bcrypt = require('bcryptjs');
const env = require('../../config/env')
const jwt = require('jsonwebtoken')


const Registering = async (data)=>{
  const userexiting =  await user.findOne({email :data.email})
  if(userexiting){
    console.log(userexiting);
    throw new AppError("user is exit", 400);
  }
  
  const User = await user.create(data);
  const newSignToken = signToken(User._id);
  const newRefreshToken = refreshSignToken(User._id);
  User.refreshToken = newRefreshToken;
  await User.save();
  return {
     User ,
     newSignToken ,
     newRefreshToken
    };
}

const login =async(data)=>{
  const {email, password} = data
  if(!email || !password) throw new AppError('email and password required',400)
  const User =await user.findOne({email}).select('+password');
  
  if(!User) throw new AppError('email not found',400)
    console.log('Password from body:', password);
console.log('Password from DB:', User.password);

  if(!await bcrypt.compare(String(password),User.password)) throw new AppError('email or password waring!!',400);
  
  const newSignToken = signToken(User._id);
  const newRefreshToken = refreshSignToken(User._id);
  User.refreshToken = newRefreshToken;
  await User.save();
  return {
     User ,
     newSignToken ,
     newRefreshToken
    };
}

const refreshToken = async (req)=>{
  const refreshToken =  req.cookies.refreshToken;
  if(!refreshToken)  throw new AppError("No Refresh Token provided",401);
  const decode = await jwt.verify(refreshToken , env.JWT_SECRET_REFRESH);
  const User = await user.findById(decode.id).select('+refreshToken');
  if(!User) throw new AppError("No user exits",401);
  if (User.refreshToken !== refreshToken)
  throw new AppError("Invalid Refresh Token", 403);
const newSignToken = signToken(User._id);
  return{
    User,
    newSignToken
  };
}



module.exports ={Registering,login,refreshToken}