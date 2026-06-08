const User = require('./user.model')
const AppError = require('../../utils/AppError')


const getProfile =  async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);
  return user;
};




const updateUser =  async (userID,data) =>{
const allowedFields = ['FirstName', 'LastName', 'avatar'];
const filteredData = {};

  for (const key of allowedFields) {
    if (data[key] !== undefined) {
      filteredData[key] = data[key];
    }
  }
const updatedUser = await User.findByIdAndUpdate(userID, filteredData, {
    new: true,
    runValidators: true,
  });
  if (!updatedUser) throw new AppError("User not found", 404);
  return updatedUser;
}

const softDeleteUser = async (userId) =>{
    const deletedUser = User.findByIdAndUpdate(
        userId,
        {isActive : false},
        {new: true,}
    );
  if (!deletedUser) throw new AppError("User not found", 404);
  return deletedUser
}


const updateUserByAdmin = async (userID, data) => {
  const allowedFields = [
    'FirstName',
    'LastName',
    'Email',
    'role',
    'isActive'
  ];
  const filteredData = {};
  for (const key of allowedFields) {
    if (data[key] !== undefined) {
      filteredData[key] = data[key];
    }
  }
  const updatedUser = await User.findByIdAndUpdate(
    userID,
    filteredData,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!updatedUser) {
    throw new AppError('User not found', 404);
  }
  return updatedUser;
};




module.exports ={getProfile,updateUser ,softDeleteUser , updateUserByAdmin}