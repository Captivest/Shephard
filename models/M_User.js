var mongoose=require('mongoose')

var UserSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        unique:true
    },
    password:String,
    todo:[{type:mongoose.Schema.Types.ObjectId,ref:'Todo'}]
})

module.exports=mongoose.model('User',UserSchema)