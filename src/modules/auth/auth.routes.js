 const express = require('express');
 const route = express.Router();
 const authController = require("./auth.controller");
 const {registerValidation} = require("./auth.validation")
const {uploadProfile} = require('../../middlewares/upload.middleware')
const userRoles = require('../../utils/userRole')

/**
 * @swagger
 * /Registering:
 *   post:
 *     summary: Register new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - password
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 */

 route.post('/Registering',uploadProfile.single('avatar'),registerValidation,authController.userRegistering);
/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         headers:
 *           Set-Cookie:
 *             description: Refresh token stored in cookie
 *             schema:
 *               type: string
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Invalid credentials
 */

 route.post('/login', authController.userLogin);
/**
 * @swagger
 * /refreshToken:
 *   post:
 *     summary: Refresh access token using cookie
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RefreshResponse'
 *       401:
 *         description: Unauthorized
 */

 route.post('/refreshToken',authController.RefreshToken);

 module.exports = route 


