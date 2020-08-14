require('dotenv').config()
const express = require('express')
const bcrypt = require('bcrypt')
const router = express.Router()
const passport = require('passport')
const User = require('../models/User')
const db = require('../database')

router.get('/register', (req, res) => {
    res.render('users/register', {
        error: req.flash('error')
    })
})

//middleware to check if user is logged in 
isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next()
    res.redirect('/users/login')
}

router.post('/register',
    passport.authenticate('local.signup', {
        successRedirect: '/users/login',
        failureRedirect: '/users/register',
        failureFlash: true
    })


)

router.get('/login', (req, res) => {
    res.render('users/login', {
        error: req.flash('error')
    })
})

router.post('/login',

    passport.authenticate('local.login', {
        successRedirect: '/users/profile',
        failureRedirect: '/users/login',
        failureFlash: true
    })

)

router.get('/profile', isAuthenticated, async (req, res) => {
    await User.findOne({_id:req.user._id},(err, user) => {
        if (!err) {
            res.render('users/profile', {
                success: req.flash('success'),
                user: user
            })
        } else {
            console.log(err)
        }
    })

})

//edit profile info
router.get('/profile/edit/:id', isAuthenticated, async (req, res) => {
    await User.findOne({ _id: req.params.id }, (err, user) => {
        if (!err) {
            res.render('users/edit', {
                success: req.flash('success'),
                user: user
            })
        } else {
            console.log(err)
        }

    })
})

//update info
router.post('/profile/edit/:id', isAuthenticated, async (req, res) => {
    let id = ({ _id: req.params.id })

    let updateUser = {
        fname: req.body.fname,
        lname: req.body.lname,
        email: req.body.email,
        password: req.body.password,
        createdAt: Date.now()
    }
    
    const salt = await bcrypt.genSalt(8)
    updateUser.password = await bcrypt.hash(updateUser.password ,salt)

    await User.updateOne(id, updateUser, (err) => {
        if (!err) {
            res.redirect('/users/profile')
            console.log('profile updated!')
        } else {
            console.log(err)
        }
    })
})

//logout user
router.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/users/login')
})

module.exports = router