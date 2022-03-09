//addUser,removeUser,getUser,getUsersInRoom
const users=[];

const addUser = ({id,username,room})=>{

    //clean the data removing spaces and converting to lowercase
    username=username.trim().toLowerCase()
    room=room.trim().toLowerCase()

    //validating the data
    if(!username || !room){
        return {
            error:'username and room are required'
        }
    }

    //check for existing user
    const existingUser = users.find((user)=>{
        return user.room===room && user.username===username
    })

    //validating username
    if(existingUser){
        return {
            error:'user is in use!'
        }
    }

    //Storing the User
    const user = {id,username,room}
    users.push(user)
    return {user}

}


// removing a user from the userlist
const removeUser = (id)=>{
    const index=users.findIndex((user)=>user.id===id)

    if(index!==-1){
        return users.splice(index,1)[0]
    }

}

//getting user data
const getUser=(id)=>{
    return users.find((user)=>user.id===id)
}

//getting users in a room
const getUsersInRoom=(room)=>{
    room=room.trim().toLowerCase()  
    return users.filter((user)=>user.room===room)
}


module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
}


