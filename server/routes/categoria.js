const express = require('express');
const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion'); //llamamos al middleware
const _ = require('underscore'); //lo utilizamos para validar los datos que envia el usuario y que es lo que puede modificar
const app = express();




let Categoria = require('../models/categoria');
///////////////////////////
//MOSTRAR TODAS LAS CATEGORIAS
///////////////////////////
app.get('/categorias', verificaToken, (req, res) => {
    Categoria.find({})
        .sort('nombre')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            if (err) {
                //si hay algun error entra aqui y retorna el error con el status
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            Categoria.count({}, (err, conteo) => {
                res.json({
                    ok: true,
                    categorias,
                    cuantos: conteo
                });
            });

        })
});

///////////////////////////
//MOSTRAR CATEGORIA POR ID
///////////////////////////
app.get('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    Categoria.findById(id, function(err, categoriaDB) {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }


        res.json({
            ok: true,
            categoriaDB
        });

    });

    // UserModel.findById(id, function(err, user) {... });
    // Categoria.findById()
});


///////////////////////////
//CREAR NUEVA CATEGORIA
///////////////////////////
app.post('/categoria', [verificaToken, verificaAdminRole], (req, res) => {
    // regresa la nueva categoria
    //req.usuario._id

    let body = req.body;
    //creamos una nueva categoria, mandandole los datos mediante la instancia del modelo
    let categoria = new Categoria({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    //guardamos el usuario con un callback
    categoria.save((err, categoriaDB) => {
        if (err) {
            //si hay algun error entra aqui y retorna el error con el status
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            //si hay algun error entra aqui y retorna el error con el status
            return res.status(400).json({
                ok: false,
                err
            });
        }
        //si todo sale conrrectamente, regresa un JSON con los datos que se regresan en el modelo, en este caso los datos guardados
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

///////////////////////////
//ACTUALIZAR NUEVA CATEGORIA
///////////////////////////
app.put('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    let body = req.body;

    let descCategoria = {
        nombre: body.nombre
    };

    Categoria.findByIdAndUpdate(id, descCategoria, { new: true, runValidators: true }, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });


});

///////////////////////////
//ELIMINAR NUEVA CATEGORIA
///////////////////////////
app.delete('/categoria/:id', [verificaToken, verificaAdminRole], (req, res) => {
    let id = req.params.id;
    // solo un administrador puede borrar categorias
    //Categoria.findByIdAndRemove
    Categoria.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            message: 'categoria eliminada correctamente'
        });

    });
});
module.exports = app;