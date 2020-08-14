const mongoose = require('mongoose')

const uri = `mongodb+srv://yassine:yassine@cluster0-wgn2y.mongodb.net/articlesDB?retryWrites=true&w=majority`

mongoose.connect(uri,{ useNewUrlParser: true, useUnifiedTopology: true},(err)=>{
     if(err) throw err
     console.log('Database Connected!')
})