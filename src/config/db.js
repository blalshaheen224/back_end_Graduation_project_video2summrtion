const moongose = require('mongoose');
const {dbUrl} = require('./env');

const conect_db = async ()=>{
    try{
         await moongose.connect(dbUrl)
         console.log("connection successfully")
    }
    catch(err){
    console.log("err conection",err.message);
    process.exit(1);
    }
}

module.exports = conect_db;