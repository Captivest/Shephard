const mongoose=require('mongoose')

const todoSchema=new mongoose.Schema({
    t_user:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
    t_title:String,
    t_body:String,
    created:{
        type:String||Number,
        default:Date.parse(new Date())
    },
    deadline:String||Number,
    overdue:{
        type:Number,
        default:0
    },
    files:Array
})

module.exports=mongoose.model('Todo',todoSchema)