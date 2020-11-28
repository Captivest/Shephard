const mongoose=require('mongoose')

const todoSchema=new mongoose.Schema({
    t_user:String,
    t_title:String,
    t_body:String
})

module.exports=mongoose.model('Todo',todoSchema)