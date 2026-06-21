const express = require('express');
const cookieParser = require('cookie-parser');
const errorMiddleWare = require('./middlewares/error.middleware');
const authRoutes  = require("./modules/auth/auth.routes")
const userRoutes =  require("./modules/users/user.routes")
const uploadRouters = require('./modules/Transcription/Transcription.routes')
const swaggerUi = require("swagger-ui-express");
const { swaggerSpec } = require("./config/swagger.js")
 const cors  = require("cors")
//express setup
const app =express();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(express.json());

app.use(
  cors({
    origin: "*"
  })
);

// const allowedOrigins = [
//     process.env.FRONTEND_URL,
//     process.env.FRONTEND_URL_2,
//     process.env.FRONTEND_URL_3,
//     process.env.FRONTEND_URL_4,
//   ];
 // cors camcled
  // app.use(
  //   cors({
  //     origin: allowedOrigins,
  //     credentials: true,
  //      })
 
  // );
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

app.use('/api/auth',authRoutes )
app.use("/api/Transcription", uploadRouters);


//errHandler
app.use(errorMiddleWare);
 
module.exports = app;
