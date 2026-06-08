const user =require('./user.model')
const asyncHandler = require('../../utils/catchAsync')
const AppError = require('../../utils/AppError')
const userService = require('./user.service')


 const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user._id);
  res.status(200).json({ status: "success", user });
});

 const updateUser = asyncHandler(async (req, res) => {
  const {FirstName, LastName } = req.body;
  const userData = {};

 if (FirstName) userData.FirstName = FirstName;
 if (LastName) userData.LastName = LastName;
 if (req.file) userData.avatar = req.file.path;

  const user = await userService.updateUser(req.user._id, userData);
  res.status(200).json({ status: "success", user });
});

 const softDeleteUser = asyncHandler(async (req, res) => {
  const user = await userService.softDeleteUser(req.user._id);
  res.status(200).json({ status: "success", message: "Account deactivated", user });
});

const updateUserByAdmin = asyncHandler(async (req, res) =>{
  const { id } = req.params;
  const updatedUser = await  userService.updateUserByAdmin(id,req.body)
  res.status(200).json({
    status: 'success',
    data: updatedUser,
})
})


module.exports = {getProfile ,updateUser , softDeleteUser , updateUserByAdmin}