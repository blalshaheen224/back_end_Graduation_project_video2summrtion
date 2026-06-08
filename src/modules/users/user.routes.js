 const express = require('express');
 const router = express.Router();

const userController = require('./user.controller.js')
const  protect  = require('../../middlewares/auth.middleware.js')
const  protect_role  = require('../../middlewares/role.middleware.js')
const {uploadProfile} = require('../../middlewares/upload.middleware.js')
const role = require("../../utils/userRole.js")
const {updateMeValidation ,updateUserByAdminValidator} = require('./user.validation.js')
router.use(protect); 

router.get("/me", userController.getProfile);
router.patch("/me", uploadProfile.single('avatar'),updateMeValidation , userController.updateUser);
router.delete("/me", userController.softDeleteUser);
router.patch("/admin/:id",protect_role(role.ADMIN , role.MANGER) , updateUserByAdminValidator ,userController.updateUserByAdmin ,);

module.exports =  router;
