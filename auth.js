const bcrypt=require('bcrypt')
const passport=require('passport')
const LocalStrategy=require('passport-local')
const GithubStrategy=require("passport-github").Strategy
const ObjectID=require('mongodb').ObjectID
//####################################################
module.exports=(app,User)=>{
    passport.serializeUser((user,done)=>{
        console.log(user,"USERRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR")
        done(null,user._id)
    })
    passport.deserializeUser((id,done)=>{
        console.log(id,"yooohoohoh")
        User.findOne({_id:new ObjectID(id)},(err,doc)=>{
            done(null,doc)
        }) 
    })
    
    passport.use(new LocalStrategy((username,password,done)=>{
        User.findOne({username:username},(err,user)=>{
            console.log(username+" trying to get in")
            if(err) return done(err)
            if(!user) return done(null,false)
            if(!bcrypt.compareSync(password,user.password)) return done(null,false)
            else{
                user=user.toObject()
                delete user.password
                console.log(user)
                return done(null,user)
            }
        })
    }))

    passport.use(new GithubStrategy({
        clientID:process.env.GITHUB_CLIENT_ID,
        clientSecret:process.env.GITHUB_CLIENT_SECRET,
        callbackURL:'http://localhost:7000/auth/github/cb'
    },(accessToken,refreshToken,profile,cb)=>{
        console.log(profile.id,"IDDDDDDDDDDDDDDDDDDDD")
        User.findOneAndUpdate({username:profile.username},{
            $set:{
                username:profile.username,
                email:profile.profileUrl
            }
        },{upsert:true,new:true,setDefaultsOnInsert:true},(err,doc)=>{
            return cb(err,doc)
        })
    }))
}
