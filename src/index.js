const express =require('express');
const path = require('path');
const http =require('http');
const socketio= require('socket.io')
const Filter=require('bad-words');



const {generateMsg,generateLocationMsg}=require('../src/utils/message')
const { addUser,removeUser,getUser,getUsersInRoom} = require('../src/utils/users')

const app =  express();
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000;

const public=path.join(__dirname,'../public');

app.use(express.static(public));


//server (emit)=> client (Receive) - UpdateCount;
//client (emit)=> server (Receive) - Increament

// let count=0

//listening user connection
io.on('connection',(socket)=>{
    console.log('new  connection');

    // socket.emit('updateCount',count);

    // socket.on('increament',()=>{
    //     count++;
    //     // socket.emit('updateCount',count)
    //     io.emit('updateCount', count)
    // })

    

    //join client to room 
    socket.on('join',(options,callback)=>{
        //adding user to the users.js for the database purpose
        const {error,user}=addUser({id: socket.id,...options})
        if(error){
            return callback(error)
        }
        //joining particular room
        socket.join(user.room)

        //sending members of a room
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })


        socket.emit('message',generateMsg('Admin','welcome!'));

        //emiting msg to the particular room
        socket.broadcast.to(user.room).emit('message',generateMsg('Admin',`${user.username} in online`));

        //io.to().emit emiting msgs to a room
        //socket.broadcast.to().emit emitting msgs to a room except the user
         callback()
    })

   //socket.broadcast.emit sending msg to everyone ,except the current user

    //listning client-message
    socket.on('usermessage',(msg,callback)=>{
        //getting user data from the database
        const user=getUser(socket.id)
        
        const filter=new Filter();
        if (filter.isProfane(msg)){
            return callback('Profanity is not allowed')
        }else if(!msg){
            return callback('please enter something')
        }

    //emiting message to the particular room-client
        io.to(user.room).emit('message',generateMsg(user.username,msg));
        callback()
    })

    //listning client location msg
    socket.on('sendLocation',(coords,callback)=>{
         //getting user data from the database
         const user=getUser(socket.id)
        //emiting location msg to everyone
        io.to(user.room).emit('locationmsg',generateLocationMsg(user.username,`https://google.com/maps?q=${coords.latidude},${coords.longitude}`));
        callback();    

        //https://google.com/maps?q=0,0
    })

   
    //listning user disconnecting
    socket.on('disconnect',()=>{
        //removing user from the users.js database
        const user=removeUser(socket.id)

        if(user){

        //emiting user disconnecting msg
        io.to(user.room).emit('message',generateMsg('Admin',`${user.username} user is disconnected`))
         //sending members of a room
         io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        }

    })


})



server.listen(port,()=>{
    console.log(`server is on port ${port}`)
})
