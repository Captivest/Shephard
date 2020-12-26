const passport = require("passport")
const bcrypt = require("bcrypt")
const Todo=require('./models/M_todo.js')
const User=require('./models/M_User.js')
const multer=require('multer')
const upload=multer()

module.exports = (app, UserDB) => {
    const isAuthenticated = (req, res, next) => {
        if(req.isAuthenticated()) return next()
        res.redirect('/')
    }
//#############################################################################################
    app.route('/').get((req, res) => {
        res.send("LANDING SITE")
    })
//#############################################################################################
    app.route('/login').post(passport.authenticate('local', {failureRedirect: '/'}), (req, res) => {
        res.redirect(`/profile/${req.body.username}`)
    })
//#############################################################################################
    app.route('/logout').get((req,res)=>{
        req.logout()
        res.redirect('/')
    })
//#############################################################################################
    app.route('/auth/github').get(passport.authenticate('github'))
    app.route('/auth/github/cb').get(passport.authenticate('github', {failureRedirect: '/'}), (req, res) => {
        console.log("SUCCESS")
        res.redirect('/profile/HELLOFROMGITHUB')
    })
//#############################################################################################
    app.get('/auth/google',
        passport.authenticate('google', {
            scope:
                ['email', 'profile']
        }
    ));
//#############################################################################################
    app.get('/auth/google/cb',
        passport.authenticate('google', {
            successRedirect: '/profile/HelloFromGoogle',
            failureRedirect: '/'
    }));
//#############################################################################################
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
//#############################################################################################
    app.route('/profile/:username').get(isAuthenticated, (req, res) => {
        res.send(req.params.username)
    })
//#############################################################################################
    app.route('/:id/newtodo').post((req,res)=>{
        let nt=new Todo({t_user:req.params.id,t_body:req.body.t_body,t_title:req.body.t_title}).populate('t_user')
        nt.save()
        User.findById(req.params.id,(err,user)=>{
            user.todo.push(nt)
            user.save()
        }).populate('todo').exec((err,user)=>{
            if(!err) return console.log("Populated Successfully")
        })
    })
//#############################################################################################
    app.route('/:tid/update').put((req,res)=>{
        Todo.findByIdAndUpdate(req.params.tid,{$set:{t_title:req.body.t_title,t_body:req.body.t_body}},{new:true},(err,todo)=>{
            if(err) res.send("Error while updating todo")
            res.send("Updated Successfully")
        })
    })
//#############################################################################################    
    app.route('/:uid/:tid/delete').delete((req,res)=>{
        Todo.findByIdAndDelete(req.params.tid,(err)=>{
            if(err) res.send("Cannot delete due to error")
            res.send("Deleted Successfully")
        })
        User.findById(req.params.uid,(err,user)=>{
            if(err) res.send("cannot find user")
            let o=user.todo.indexOf(req.params.tid)
            user.todo.splice(o,1)
            user.save()
            console.log("Removed from user")
        })
    })
//#############################################################################################
    app.route('/:tid/uploadfiles').post(upload.fields({name:'files',maxCount:5}))
//#############################################################################################
    app.route('/:tid/:fname/downloadfile').get((req,res)=>{
        Todo.findById(req.params.tid,(err,t_data)=>{
            if(err) res.send("Todo not Found")
            else{
               let file=t_data.find(fl=>fl.originalname===fname)
               let newFile=new Buffer.alloc(file.buffer.length,file.buffer,'utf-8')
               return newFile
            }
        })
    })
    //Use React to create download function using window.URl.createObjectUrl(newFile) then pass the url to the download button
//#############################################################################################    
    app.route('/:uid/update').put((req,res)=>{
        User.findByIdAndUpdate(req.params.uid,{
            $set:{
                username:req.body.username,
                email:req.body.email,
                password:bcrypt.hashSync(req.body.password,12)
            }
        },{new:true},(err)=>{
            if(err) res.send('Error while updating User')
            else res.send('User updated successfully')
        })
    })
}