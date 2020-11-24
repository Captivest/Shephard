const passport=require("passport")
const bcrypt=require("bcrypt")

//##################################################
module.exports=(app,UserDB)=>{
    const isAuthenticated=(req,res,next)=>{
        if(req.isAuthenticated()) return next()
        res.redirect('/')
    }

    app.route('/').get((req,res)=>{
        res.send("LANDING SITE")
    })

    app.route('/login').post(passport.authenticate('local',{failureRedirect:'/'}),(req,res)=>{
        res.redirect(`/profile/${req.body.username}`)
    })
    
    app.route('/auth/github').get(passport.authenticate('github'))
    app.route('/auth/github/cb').get(passport.authenticate('github',{failureRedirect:'/'}),(req,res)=>{
        console.log("SUCCESS")
        res.redirect('/profile/HELLOFROMGITHUB')
    })

    app.route('/register').post((req,res,next)=>{
        const hash=bcrypt.hashSync(req.body.password,12)
        UserDB.findOne({username:req.body.username},(err,user)=>{
            if(err) next(err)
            else if(user) res.redirect('/')
            else{
                new UserDB({username:req.body.username,email:req.body.email,password:hash}).save()
            }
        })
    },passport.authenticate('local',{failureRedirect:'/'}),(req,res,next)=>{
        res.redirect(`/profile/happy`)
    })

    app.route('/profile/:username').get(isAuthenticated,(req,res)=>{
        res.send(req.params.username)
    })
}