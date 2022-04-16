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
    require('./models/Postagem')
    const Postagem = mongoose.model('postagens')
    require('./models/Categoria')
    const Categoria = mongoose.model('categorias')
    const usuarios = require('./routes/usuario')

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

    app.get('/', (req, res) => {
      Postagem.find().lean().populate('categoria').sort({data: 'desc'}).then((postagens) => {
        res.render('index',{postagens: postagens})
      }).catch((err) => {
        req.flash('error_msg', 'Houve um erro')
        res.redirect('/404')
      })
    })

    app.get('/postagem/:slug',(req, res)=>{
      Postagem.findOne({slug: req.params.slug}).lean().then((postagem) => {
        if(postagem){
          res.render('postagem/index',{postagem: postagem})
        }else{
          req.flash('error_msg','Está postagem não existe')
        }
      }).catch(err => {
        req.flash('error_msg','Houve um erro')
        res.redirect('/')
      })
    })

    app.get('/categorias',(req, res) => {
      Categoria.find().lean().then((categorias) =>{
        res.render('categorias/index', {categorias: categorias})
      }).catch(err => {
        console.log(err)
        req.flash('error_msg','Houve um erro')
        res.redirect('/')
      })
    })

    app.get('/categorias/:slug', (req, res) => {
      Categoria.findOne({slug: req.params.slug}).lean().then((categoria)=>{
        if(categoria){
          Postagem.find({categoria: categoria._id}).lean().then((postagens)=>{
            res.render('categorias/postagens',{postagens: postagens, categoria: categoria})
          }).catch((err)=>{
            req.flash('error_msg', 'Houve um erro')
            res.redirect('/')
          })
        }else{
          req.flash('error_msg', 'Esta categoria não existe')
          res.redirect('/')
        }
      }).catch(err => {
        req.flash('error_msg', 'Houve um erro')
        res.redirect('/')
      })
    })



    app.get('/404',(req, res) => {
      res.send('Erro 404')
    })

    app.use('/admin',admin)
    app.use('/usuarios', usuarios)
//Outros
const PORT = 8081
app.listen(PORT,()=>{
    console.log('Servidor rodando na porta http://localhost:8081 ...')
})