const passport = require("passport")
const bcrypt = require("bcrypt")
const Todo=require('./models/M_todo.js')
const User=require('./models/M_User.js')

module.exports = (app, UserDB) => {
    const isAuthenticated = (req, res, next) => {
        if(req.isAuthenticated()) return next()
        res.redirect('/')
    }

    app.route('/').get((req, res) => {
        res.send("LANDING SITE")
    })

    app.route('/login').post(passport.authenticate('local', {failureRedirect: '/'}), (req, res) => {
        res.redirect(`/profile/${req.body.username}`)
    })

    app.route('/logout').get((req,res)=>{
        req.logout()
        res.redirect('/')
    })

    app.route('/auth/github').get(passport.authenticate('github'))
    app.route('/auth/github/cb').get(passport.authenticate('github', {failureRedirect: '/'}), (req, res) => {
        console.log("SUCCESS")
        res.redirect('/profile/HELLOFROMGITHUB')
    })

    app.get('/auth/google',
        passport.authenticate('google', {
            scope:
                ['email', 'profile']
        }
    ));

    app.get('/auth/google/cb',
        passport.authenticate('google', {
            successRedirect: '/profile/HelloFromGoogle',
            failureRedirect: '/'
    }));

    app.route('/register').post((req, res, next) => {
        const hash = bcrypt.hashSync(req.body.password, 12)
        UserDB.findOne({username: req.body.username}, (err, user) => {
            if(err) next(err)
            else if(user) res.redirect('/')
            else {
                new UserDB({username: req.body.username, email: req.body.email, password: hash}).save()
            }
        })
    }, passport.authenticate('local', {failureRedirect: '/'}), (req, res, next) => {
        res.redirect(`/profile/happy`)
    })

    app.route('/profile/:username').get(isAuthenticated, (req, res) => {
        res.send(req.params.username)
    })

    app.route('/:id/newtodo').post((req,res)=>{
        let nt=new Todo({t_user:req.params.id,t_body:req.body.t_body,t_title:req.body.t_title})
        nt.save()
        User.findById(req.params.id,(err,user)=>{
            user.todo.push(nt)
            user.save()
        }).populate('todo').exec((err)=>{
            if(!err) return console.log("Populated Successfully")
        })
    })
}