require('dotenv').config()
var express=require('express')
var app=express()
var session=require('express-session')
var auth=require('./auth.js')
var routes=require('./routes.js')
var UserDB=require('./models/M_User.js')
var mongoose=require('mongoose')
const passport = require('passport')
var MongoStore=require('connect-mongo')(session)
var URI=process.env.URI

app.use(express.json())
app.use(express.urlencoded({extended:true}))
mongoose.set("useFindAndModify",false)
mongoose.set('useCreateIndex', true)

app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:true,
    store:new MongoStore({url:URI}),
    saveUninitialized:true,
    cookie:{secure:false}
}))

app.use(passport.initialize())
app.use(passport.session())

mongoose.connect(URI,{useNewUrlParser:true,useUnifiedTopology:true})

auth(app,UserDB)
routes(app,UserDB)
app.get("/",(req,res)=>{
    res.send("HELLO")
})

app.listen(7000,()=>{
    console.log("Server Started")
})