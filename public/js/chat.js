const socket =io();

//Elements form
const $msgForm=document.querySelector('#messageform');
const $msgInput=$msgForm.querySelector('input');
const $msgButton=$msgForm.querySelector('button');

//Location
const $locationButton=document.querySelector('#send-location')
//messages
const $msgs=document.querySelector('#messages');
// templates
const messageTemplate=document.querySelector('#message-template').innerHTML
const locationTemplate=document.querySelector('#location-template').innerHTML
const sidebarTemplate=document.querySelector('#sideBar-template').innerHTML

//parsing name and room parameters from the location.search using qs library
const {username, room}=Qs.parse(location.search,{ignoreQueryPrefix:true})

//function for auto scolling
const autoscolling = ()=>{
    //new msg element
    const $newMessage=$msgs.lastElementChild;
   //height of the new message
     const newMessageStyle=getComputedStyle($newMessage)
    const newMessageMargin=parseInt(newMessageStyle.marginBottom)
    const newMessageHeight=$newMessage.offsetHeight+newMessageMargin
   //visible height
   const visibleHeight=$msgs.offsetHeight

   //height of messages container
   const containerHeight=$msgs.scrollHeight

   //how far have i scrolled
   const scrollOffset=$msgs.scrollTop+visibleHeight

   if(containerHeight-newMessageHeight<=scrollOffset){
    $msgs.scrollTop=$msgs.scrollHeight
   }


}


//listning users in a room
socket.on('roomData',({room,users})=>{
//rendering dynamic template using Mustache libery
const html=Mustache.render(sidebarTemplate,{
    room,
    users
})
document.getElementById('sidebar').innerHTML=html
})

//listening msg from the server
socket.on('message',(msg)=>{
    
    
    //rendering dynamic template using Mustache libery
    const html=Mustache.render(messageTemplate,{
        username:msg.username,
        msg:msg.text,
        time:moment(msg.createdAt).format('h:mm a')
    });
    $msgs.insertAdjacentHTML('beforeend',html)
    autoscolling()
})



//location listning
socket.on('locationmsg',(msg)=>{
    console.log(msg);
    //rendering dynamic template for location 
    const html=Mustache.render(locationTemplate,
        {
            username:msg.username,
           url: msg.text,
           time: moment(msg.createdAt).format('h:mm a')
        })
        $msgs.insertAdjacentHTML('beforeend',html)
        autoscolling()
})


//sending msg from the user to the server
document.querySelector('#messageform').addEventListener('submit',(e)=>{
e.preventDefault()

// disabling  button after sending msg
$msgButton.setAttribute('disabled','true')
message=e.target.elements.usermsg.value



socket.emit('usermessage',message,(err)=>{
    //enabling button before sending msg
    $msgButton.removeAttribute('disabled','true');
    $msgInput.value='';
    $msgInput.focus();

    //checking Profanity of a message 
    if(err){
       return console.log(err);
    }
    console.log('msg delivered');
})


})

//sending geolocation to the server
document.querySelector('#send-location').addEventListener('click',()=>{

    //disabling button after sending
    $locationButton.setAttribute('disabled','true')

    if(!navigator.geolocation){
        return alert('user geolocation is not supported')
    }
    navigator.geolocation.getCurrentPosition((position)=>{
        console.log(position)
        socket.emit('sendLocation',{
            latidude:position.coords.latitude,
            longitude:position.coords.longitude
        }, ()=>{
            console.log('location shared')
            $locationButton.removeAttribute('disabled','true')
        })
    })
})


//emiting username and name client to the server
socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/';
    }
})


//pratice section

// socket.on('updateCount',(count)=>{
// console.log('user update',count)
// })

// document.querySelector('#increament').addEventListener('click',()=>{
//     console.log('clicked');
//     socket.emit('increament')
// })