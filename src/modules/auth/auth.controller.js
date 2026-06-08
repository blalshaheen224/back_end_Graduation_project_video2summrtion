const asyncHandler = require("../../utils/catchAsync")
const AppErro = require("../../utils/AppError")
const env = require('../../config/env')
const {Registering,login,refreshToken} = require('./auth.service');

const getAllUser =asyncHandler ( async (req,res)=>{
         const page =   Number ( req.query.page) || 1

         const limit =  Number(req.query.limit) ||2

         const skip = (page -1)*limit

         const alluser = await user.find().skip(skip).limit(limit);

         const totalUsers = await user.countDocuments();

         res.status(200).json({
             success : "true" 
             , page
             , totalPage : Math.ceil(totalUsers / limit)
              ,  data : alluser  })
      
 })


const userRegistering = asyncHandler( async (req,res)=>{
const { fullName, email, password, phoneNumber } = req.body;

const userData = {
  fullName,
  email,
  password,
  phoneNumber,
};

const result = await Registering(userData);
const User =  result.User
res.status(201).json({
  success: true,
  token: result.newSignToken,
  user: {
    id: User._id,
    fullName : User.fullName,
    email : User.email,
    phoneNumber : User.phoneNumber
  }
});
})


const userLogin = asyncHandler( async (req,res)=>{
    const {User ,newSignToken ,newRefreshToken}  = await login(req.body);
    res.cookie('refreshToken',newRefreshToken,{
        httpOnly : true ,
        secure : env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
    res.status(200).json({
       sucess : true,
        newSignToken,
       data : User
    })
 } )

 const RefreshToken =asyncHandler ( async (req,res)=>{
    const result = await refreshToken(req) ;
    res.status(200).json({
      sucess: true,
      token: result.newSignToken,
      user: result.User,
    });
})

const uploadAvatar = asyncHandler( async (req,res) => {
 if(!req.file) throw new AppErro("please upload image",400);

 const User = await user.findByIdAndUpdate(req.user._id, 
    {avatar : req.file.path},
    {new : true}  
);
 res.status(200).json({
    sucess : true ,
    data : User
 })
})

 module.exports = {
     getAllUser,
     userRegistering,
     userLogin,
     RefreshToken,
     uploadAvatar
 }

