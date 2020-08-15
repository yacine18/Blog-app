require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const ejs = require('ejs')
const Article = require('./models/Article')
const User = require('./models/User')
const db = require('./database')
const passport = require('passport')
const session = require('express-session')
const flash = require('connect-flash')
const passportSetup = require('./passport-setup')
// bodyParser config
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))


// config ejs
app.set('view engine', 'ejs')

// session and flash config .
app.use(session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 60000 * 5}
}))
app.use(flash())

//config passport
app.use(passport.initialize())
app.use(passport.session())


// articles route
const articleRoutes = require('./routes/articles')
app.use('/blog', articleRoutes)

//users route
const userRoutes = require('./routes/users')
app.use('/users',userRoutes)

//admin route
const adminRoute = require('./routes/admin')
app.use('/auth',adminRoute)


app.get('/',(req,res)=>{
   res.redirect('/blog')
})


const PORT = process.env.PORT || 3000
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})