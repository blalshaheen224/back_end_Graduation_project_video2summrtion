const app = require('./app')
const conectDB = require('./config/db');
const {PORT} = require('./config/env')

const startServer = async () => {
  await conectDB();
}
app.listen(PORT,()=>{
    console.log("server listen in",PORT);
});

startServer()
