const mongoose = require('mongoose');
const validate = require("validator");
const userRole = require('../../utils/userRole')
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      trim: true,
      validate: [validate.isEmail, "Invalid email"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    phoneNumber: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: Object.values(userRole),
      default: userRole.USER,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);
UserSchema.pre('save', async function(next){
    if(!this.isModified('password')) return
    this.password = await bcrypt.hash(this.password,12);
})





UserSchema.pre(/^find/, async function(next) {
  this.where({ isActive: true });
});



UserSchema.methods.toJSON  = function(){
   const object =  this.toObject();
   delete object.password;
   delete object.refreshToken;
   delete object.__v;
   return object
}



module.exports = mongoose.model("user", UserSchema);



