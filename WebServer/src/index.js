const path = require('path')
const express = require('express')
const morgan = require('morgan')
const handlebars = require('express-handlebars')
const WebSocket = require('ws');
const fs = require('fs')
const app = express()
const port = 3000
const WS_PORT  = 8888;

const wsServer = new WebSocket.Server({port: WS_PORT}, ()=> console.log(`WS Server is listening at ${WS_PORT}`));

let connectedClients = [];
wsServer.on('connection', (ws, req)=>{
    console.log('Connected');
    connectedClients.push(ws);

    ws.on('message', data => {
        connectedClients.forEach((ws,i)=>{
            if(ws.readyState === ws.OPEN){
                ws.send(data);
                fs.writeFileSync("test.jpg", data);
            }else{
                connectedClients.splice(i ,1);
            }
        })
    });
});



const route = require('./routes');

const db = require('./config/db');
db.connect();

app.use(express.static(path.join(__dirname, 'public'))); //?

app.use(express.urlencoded({
  extended:true //?
}))
app.use(express.json())

// HTTP logger
app.use(morgan('tiny')); //?

// Template engine
app.engine('hbs', handlebars({
  extname: '.hbs'
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources/views'))
  
//Routes init
route(app);

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`)
});
