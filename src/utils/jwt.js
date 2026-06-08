const jwt = require('jsonwebtoken')
const env = require('../config/env')

const signToken = (userID) => {
    console.log("time",env.JWT_EXPIRES_IN)
 return jwt.sign(
   {id : userID,},
    env.JWT_SECRET,
    {expiresIn : env.JWT_EXPIRES_IN}
 );
};

const refreshSignToken = (userID) =>{
        console.log("time",env.JWT_EXPIRES_IN_REFRESH)
   return jwt.sign(
        {id : userID},
        env.JWT_SECRET_REFRESH,
        {expiresIn : env.JWT_EXPIRES_IN_REFRESH}
    )
}

module.exports = {signToken , refreshSignToken}