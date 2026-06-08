const  {NODE_ENV} = require('../config/env')

const errorMiddleWare = (err,req,res,next)=>{
   err.statusCode = err.statusCode || 500 ;
   err.status = err.status || 'error'
   if('development' === NODE_ENV ){
     return res.status(err.statusCode||500).json({
        status : err.status ,
        message : err.message,
        stack : err.stack,
        error : err
     })
   }//'development' === NODE_ENV 
    if(true){
      //err.isOperational
        if(true){
           return res.status(err.statusCode||500).json({
             status : err.status ,
             message : err.message,
             stack : err.stack?.split('\n')[1]
           });
        }
    }
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong'
    }); 
}

module.exports = errorMiddleWare;