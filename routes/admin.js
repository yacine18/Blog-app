require('dotenv').config()
const express = require('express')
const bcrypt = require('bcrypt')
const router = express.Router()
const passport = require('passport')
const User = require('../models/User')
const Article = require('../models/Article')
const db = require('../database')
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn

// middleware to check if the user is admin
isAdmin = () => {
    return [
        ensureLoggedIn('/auth/admin'),
        (req, res, next) => {
            if (req.user && req.user.isAdmin === true)
                next()
            else
                res.status(401).json(`Unauthorized, You don't have admin rights to access to this page`)
        }
    ]
}

router.get('/admin', (req, res) => {
    res.render('users/admin', {
        error: req.flash('error')
    })
})

router.post('/admin',

    passport.authenticate('local.login', {
        successRedirect: '/auth/dashboard',
        failureRedirect: '/auth/admin',
        failureFlash: true
    })

)

router.get('/dashboard', isAdmin(), async (req, res) => {
    await Article.find((err, articles) => {
        if (!err) {
            res.render('users/dashboard', {
                articles: articles,
            })
        } else {
            console.log(err)
        }
    })


})

//edit article
router.get('/dashboard/edit/:id', isAdmin(), async(req, res) => {
    let id = { _id: req.params.id }
    await Article.findOne(id, (err, article) => {
        if (!err) {
            res.render('users/editAdmin', {
                article: article
            })
        } else {
            console.log(err)
        }
    })

})

//update article
router.post('/dashboard/edit/:id', isAdmin(), async(req, res) => {
    let id = { _id: req.params.id }
    let updateArticle = {
        title: req.body.title,
        description: req.body.description,
    }

    await Article.updateOne(id, updateArticle, (err) => {
        if (!err) {
            console.log('article updated from admin panel')
            res.redirect('/auth/dashboard')
        } else {
            console.log(err)
        }
    })
})

//delete article
router.get('/dashboard/delete/:id', isAdmin(), async(req, res) => {
    let id = { _id: req.params.id }
    await Article.deleteOne(id, (err) => {
        if (!err) {
            console.log('article deleted from admin panel!')
            res.redirect('/auth/dashboard')
        } else {
            console.log(err)
        }
    })

})

//admin logout
router.get('/admin/logout', isAdmin(), (req, res) => {
    req.logout()
    res.redirect('/auth/admin')
})

//get all users from DB
router.get('/dashboard/users', isAdmin(), async(req, res) => {
    await User.find((err, users) => {
        if (!err) {
            res.render('users/usersAdmin', {
                users: users
            })
        } else {
            console.log(err)
        }
    })
})

//edit one user
router.get('/dashboard/users/edit/:id', isAdmin(), async(req, res) => {
    let id = { _id: req.params.id }
   await User.findOne(id, (err, user) => {
        if (!err) {
            res.render('users/editUser', {
                user: user
            })
        } else {
            console.log(err)
        }
    })
})

//update user informations
router.post('/dashboard/users/edit/:id', async (req, res) => {
    let id = { _id: req.params.id }
    let updateUser = {
        fname: req.body.fname,
        lname: req.body.lname,
        email: req.body.email,
        password: req.body.password,
        isAdmin:req.body.isAdmin
    }
    const salt = await bcrypt.genSalt(8)
    updateUser.password = await bcrypt.hash(updateUser.password, salt)

    await User.updateOne(id, updateUser, isAdmin(), (err) => {
        if (!err) {
            res.redirect('/auth/dashboard/users')
            console.log('user updated from admin panel')
        } else {
            console.log(err)
        }
    })
})


//delete one user
router.get('/dashboard/users/delete/:id', isAdmin(), async(req, res) => {
    let id = { _id: req.params.id }
    await User.deleteOne(id, (err) => {
        if (!err) {
            res.redirect('/auth/dashboard/users')
            console.log('user deleted from admin panel')
        } else {
            console.log(err)
        }
    })
})

//articles search query 
router.get('/dashboard/search', async(req, res)=>{
    if (req.query.q) {
      const regex = new RegExp((req.query.q), 'gi');
     await Article.find({ "title": regex }, (err, articles) =>{
          if(err) {
              console.log(err);
          } else {
             res.render("users/dashboard", { 
               articles: articles 
              });
          }
      });
    }
  });

  //users search query
  router.get('/dashboard/users/search', async(req, res)=>{
    if (req.query.q) {
      const regex = new RegExp((req.query.q), 'gi');
      await User.find({ "fname": regex }, (err, users) =>{
          if(err) {
              console.log(err);
          } else {
             res.render("users/usersAdmin", { 
               users: users 
              });
          }
      });
    }
  });

module.exports = router