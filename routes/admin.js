const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Categoria')
const Categoria = mongoose.model('categorias')
require('../models/Postagem')
const Postagem = mongoose.model('postagens')
const {admin} = require('../helpers/eAdmin')

router.get('/',admin,(req, res) => {
    res.render('admin/index')
})

router.get('/posts',admin,(req, res) => {
    res.send('Página POSTs')
})

router.get('/categorias',admin,(req, res) => {
    Categoria.find().sort({date: 'desc'}).lean().then((categorias) => {
        res.render('admin/categorias',{categorias: categorias})
    }).catch((err) => {
        req.flash(`Erro: ${err}`)
        res.redirect('/admin')
    })
})

router.get('/categorias/add',admin,(req, res)=>{
    res.render('admin/addcategorias')
})

router.post('/categorias/nova',admin,(req, res) => {

    var erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({text: 'Nome invalido'})
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
       erros.push({text: 'Slug invalido'}) 
    }

    if(req.body.nome.length < 2){
        erros.push({text: 'Nome muito pequeno'})
    }

    if(erros.length > 0){
        res.render('admin/addcategorias', {erros: erros})
    }else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Categoria(novaCategoria).save().then(() =>{
            req.flash('success_msg', 'Categoria salva com sucesso')
            res.redirect('/admin/categorias')
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao salvar categoria')
            res.redirect('/admin')
        })
    }
})

router.get('/categorias/edit/:id', admin,(req, res) => {
    Categoria.findOne({_id: req.params.id}).lean().then((categoria) => {
        res.render('admin/editcategorias', {categoria: categoria})
    }).catch((err) => {
        req.flash('error_msg', 'Esta categoria não existe')
        res.redirect('/admin/categorias')
    })
})

router.post("/categorias/edit",admin, (req, res) => {
    Categoria.findOne({ _id: req.body.id }).then((categoria) => {
        let erros = []

        if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
            erros.push({ texto: "Nome invalido" })
        }
        if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
            erros.push({ texto: "Slug invalido" })
        }
        if (req.body.nome.length < 2) {
            erros.push({ texto: "Nome da categoria muito pequeno" })
        }
        if (erros.length > 0) {
            Categoria.findOne({ _id: req.body.id }).lean().then((categoria) => {
                res.render("admin/editcategorias", { categoria: categoria})
            }).catch((err) => {
                req.flash("error_msg", "Erro ao pegar os dados")
                res.redirect("admin/categorias")
            })          
        } else {
            categoria.nome = req.body.nome
            categoria.slug = req.body.slug

            categoria.save().then(() => {
                req.flash("success_msg", "Categoria editada com sucesso!")
                res.redirect("/admin/categorias")
            }).catch((err) => {
                req.flash("error_msg", "Erro ao salvar a edição da categoria")
                res.redirect("admin/categorias")
            })
        }
    }).catch((err) => {
        req.flash("error_msg", "Erro ao editar a categoria")
        req.redirect("/admin/categorias")
    })
})


router.post('/categorias/deletar',admin,(req, res)=>{
    Categoria.remove({_id: req.body.id}).then(() => {
        req.flash('success_msg', 'Categoria deletada com sucesso')
        res.redirect('/admin/categorias');
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro')
        res.redirect('/admin/categorias')
    })
})

router.get('/postagens',admin,(req, res) => { 
    Postagem.find().populate('categoria').sort({data: 'desc'}).lean().then((postagens) =>{
        res.render('admin/postagens',{postagens: postagens})
    }).catch(err =>{
        req.flash('error_msg','Houve um erro')
        res.redirect('/admin')
    })
})

router.get('/postagens/add',admin,(req, res)=>{
    Categoria.find().lean() .then((categorias) =>{
        res.render('admin/addpostagens',{categorias: categorias})
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao carregar o formulario')
        res.redirect('/admin/postagens')
    })
})

router.post('/postagens/nova',admin,(req, res)=>{

    var erros = [];

    if(req.body.categoria == 0){
        erros.push({texto: 'Categoria invalida'})
    }
    if(erros.length > 0){
        res.render('admin/postagens',{erros: erros})
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }

        new Postagem(novaPostagem).save().then(()=>{
            req.flash('success_msg','Postagem criada com sucesso')
            res.redirect('/admin/postagens')
        }).catch(err=>{
            req.flash('error_msg','Houve um erro')
            res.redirect('/admin/postagens')
        })
    }

})

router.get('/postagens/edit/:id', admin,(req, res) => {

    Postagem.findOne({_id: req.params.id}).lean().then((postagem) =>{

        Categoria.find().lean().then((categorias) =>{
            res.render('admin/editpostagens', {categorias: categorias, postagem: postagem});
        }).catch((err) => {
            req.flash('error_msg','Houve um erro')
            res.redirect('/admin/postagens')
        })

    }).catch(err =>{
        req.flash('error_msg','Houve um erro')
        res.redirect('/admin/postagens')
    })

})

router.post('/postagem/edit',admin,(req, res)=>{

    Postagem.findOne({_id: req.body.id}).then((postagem)=>{
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.categoria = req.body.categoria
        postagem.conteudo = req.body.conteudo

        postagem.save().then(() =>{
            req.flash('success_msg','Postagem editada com sucesso')
            res.redirect('/admin/postagens')
        }).catch(err =>{
            req.flash('error_msg','Houve um erro')
            res.redirect('/admin/postagens')
        })


    }).catch((err)=>{
        req.flash('error_msg', 'Houve um erro')
        res.redirect('/admin/postagens')
    })

})

router.get('/postagens/deletar/:id',admin, (req, res) => {
    Postagem.remove({_id:req.params.id}).then(() =>{
        req.flash('success_msg', 'Postagem deletada com sucesso')
        res.redirect('/admin/postagens')
    }).catch((err)=>{
        req.flash('error_msg', 'Houve um erro interno')
        res.redirect('/admin/postagens')

    })
})

module.exports = router