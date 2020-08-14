const express = require('express')
const router = express.Router()
const db = require('../database')
const Article = require('../models/Article')

//middleware to check if user is logged in 
isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next()
    res.redirect('/users/login')
}

router.get('/', async(req, res) => {
   await Article.find((err, articles) => {
        if (!err) {
            // res.json(articles)


            res.render('articles/index', {
                articles: articles
            })
        } else {
            console.log(err)
        }
    })
})

//get one article 
router.get('/article/:id', async(req, res) => {
    await Article.findOne({ _id: req.params.id }, (err, article) => {
        if (!err) {
            res.render('articles/post', {
                article: article
            })
        } else {
            console.log(err)
        }
    })

})

// create new article
router.get('/create', isAuthenticated, (req, res) => {
    res.render('articles/new')
})

//save articles on DB
router.post('/create', async(req, res) => {
    let newArticle = await new Article({
        title: req.body.title,
        description: req.body.description,
        createdAt: Date.now()
    })

   await newArticle.save((err) => {
        if (err) console.log(err)
        console.log('Article added successfully!')
        res.redirect('/blog')
    })
})

//edit article
router.get('/update/:id', isAuthenticated, async (req, res) => {

    await Article.findOne({ _id: req.params.id }, (err, article) => {
        if (!err) {
            res.render('articles/edit', {
                article: article
            })
        } else {
            console.log(err)
        }
    })
})

// update article
router.post('/update/:id', isAuthenticated, (req, res) => {
    let query = ({ _id: req.params.id })
    let updatedArticle = {
        title: req.body.title,
        description: req.body.description,
    }
    Article.updateOne(query, updatedArticle, (err) => {
        if (!err) {
            res.redirect('/')
            console.log('updated!')
        } else {
            console.error(err)
        }
    })

})

// delete article
router.get('/delete/:id', isAuthenticated, async (req, res) => {

    let id = await { _id: req.params.id }
    await Article.deleteOne(id, (err) => {
        if (!err) {
            console.log('deleted!')
            res.redirect('/')
        } else {
            console.log(err)
        }
    })
})

//search query
router.get('/search', (req, res)=>{
    if (req.query.q) {
      const regex = new RegExp((req.query.q), 'gi');
      Article.find({ "title": regex }, (err, articles) =>{
          if(err) {
              console.log(err);
          } else {
             res.render("articles/index", { 
               articles: articles 
              });
          }
      });
    }
  });



module.exports = router