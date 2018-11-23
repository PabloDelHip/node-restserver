const express = require('express');
const bcrypt = require('bcrypt'); //se utiliza par encryptar las contraseñas
const _ = require('underscore'); //lo utilizamos para validar los datos que envia el usuario y que es lo que puede modificar
const Usuario = require('../models/usuario'); //llamamos al modelo usuario, donde esta la logica de la BD
const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion'); //llamamos al middleware
const app = express();

//el segundo parametro es un middleware
app.get('/usuario', verificaToken, (req, res) => {

    return res.json({
        usuario: req.usuario,
        nombre: req.usuario.nombre,
        email: req.usuario.email,
    })

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);
    Usuario.find({}, 'nombre email role estado google img')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) {
                //si hay algun error entra aqui y retorna el error con el status
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            Usuario.count({}, (err, conteo) => {
                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo
                });
            });

        })

    // res.json('get Usuario');
});

app.post('/usuario', [verificaToken, verificaAdminRole], (req, res) => {

    let body = req.body;
    //creamos un nuevo usuario, mandandole los datos mediante la instancia del modelo
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10), //realizamos la encriptacion de la contreña
        role: body.role
    });

    //guardamos el usuario con un callback
    usuario.save((err, usuarioDB) => {
        if (err) {
            //si hay algun error entra aqui y retorna el error con el status
            return res.status(400).json({
                ok: false,
                err
            });
        }
        //usuarioDB.password = null;
        //si todo sale conrrectamente, regresa un JSON con los datos que se regresan en el modelo, en este caso los datos guardados
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
    // if (body.nombre === undefined) {
    //     res.status(400).json({
    //         ok: false,
    //         mensaje: 'El nombre es necesario'
    //     });
    // } else {
    //     res.json({
    //         persona: body
    //     });
    // }

});

//los dos puntos indican que es un valor que sera ingresado por el usuario
app.put('/usuario/:id', [verificaToken, verificaAdminRole], (req, res) => {

    //de esta manera llamamos a los parametros
    let id = req.params.id;
    //indicamos que datos son los que si pueden ser modificados en la base de datos
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    //le indicamos que nos busque a un usuario con el ID indicado y que lo modifique
    //el primer valor es el id que mandamos
    //el segundo es todo el cuerpo request que enviamos que ya fue modificado previamente
    //le indicamos mediante un objeto que retorne los valores modiciados y que aplique las validaciones echas en el modelo
    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });


});

app.delete('/usuario/:id', [verificaToken, verificaAdminRole], (req, res) => {
    let id = req.params.id;

    // Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

    let cambiaEstado = {
        estado: false
    };

    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioBorrado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        };

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        });

    });
});

module.exports = app;