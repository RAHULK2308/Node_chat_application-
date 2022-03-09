const generateMsg=(username,text)=>{
    return {
    username,    
    text,
    'createdAt':new Date().getTime()
    }
}

const generateLocationMsg=(username,text)=>{
    return {
        username,
        text,
        'createdAt':new Date().getTime()
    }
}


module.exports={
    generateMsg,
    generateLocationMsg,
    
}