const passport = require('passport')
const bcrypt = require('bcrypt')
const User = require('./models/User')
const LocalStrategy = require('passport-local').Strategy


//save user in the session
passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user)
    })
})


//register user
passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req,username, password, done) => {
    User.findOne({ email: username }, async (err, user) => {
        if (err) {
            return done(err)
        } if (user) {
            return done(null, false, req.flash('error','user already exists!'))
        } if (!user) {
            let newUser = await new User({
                fname: req.body.fname,
                lname: req.body.lname,
                email: req.body.email,
                password: req.body.password,
                createdAt: Date.now()
            })

            const salt = await bcrypt.genSalt(8)
            newUser.password = await bcrypt.hash(newUser.password, salt)

            await newUser.save((err, user) => {
                if (!err) {
                    return done(null, user, req.flash('success','user added!'))
                } else {
                    console.log(err)
                }
            })
        }
    })
}

))

//login user
passport.use('local.login', new LocalStrategy({

usernameField: 'email',
passwordField: 'password',
passReqToCallback: true

},(req,username,password,done)=>{
   
    //find user
    User.findOne({email:username},async(err,user)=>{
        if(err){
            return done(null,false,req.flash('error','something wrong'))
        }
        if(!user){
           
            return done(null,false,req.flash('error','User not found!'))
        }
        if(user){
            const validPassword = await bcrypt.compare(req.body.password,user.password)
            if(validPassword){
                return done(null, user,req.flash('success','logged in successfully'))
            }else{
                return done(null, false,req.flash('error','email or password invalid'))
            }
        }
    })
}
))




