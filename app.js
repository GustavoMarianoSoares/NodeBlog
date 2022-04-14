//Carregando bibliotecas
    const express = require('express')
    const handlebars = require('express-handlebars')
    const bodyParser = require('body-parser')
    const app = express()
    const path = require('path')
    const admin = require('./routes/admin')
    const mongoose = require('mongoose')
    const session = require('express-session')
    const flash = require('connect-flash')

//Configuracoes
  //Sessão
    app.use(session({
      secret: 'curso',
      resave: true,
      saveUninitialized: true
    }))
    app.use(flash())
  //Middleware
    app.use((req, res, next) =>{
      res.locals.success_msg = req.flash('success_msg')
      res.locals.error_msg = req.flash('error_msg')
      next()
    })

  //bodyParser
    app.use(express.urlencoded({extented:true}))
    app.use(express.json())
  //Handlebars
    app.engine('handlebars', handlebars.engine({defaultLayout: 'main'}))
    app.set('view engine', 'handlebars')
  //Mongoose
    mongoose.connect('mongodb://localhost/blogapp').then(()=>{
      console.log('Conectado ao Banco ...')
    }).catch(err =>{
      console.log(`Erro ao conectar ao banco: ${err}`);
    })
  //Public
    app.use(express.static(path.join(__dirname, 'public')))

//Rotas
    app.use('/admin',admin)
//Outros
const PORT = 8081
app.listen(PORT,()=>{
    console.log('Servidor rodando na porta http://localhost:8081 ...')
})