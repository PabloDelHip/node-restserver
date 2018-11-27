const express = require('express');
const bcrypt = require('bcrypt'); //se utiliza par encryptar las contraseñas
const jwt = require('jsonwebtoken'); //con esta libreria creamos tokens para los usuarios de nuestra aplicacion
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);
const Usuario = require('../models/usuario'); //llamamos al modelo usuario, donde esta la logica de la BD

const app = express();

app.post('/login', (req, res) => {

    let body = req.body;
    //con findOne hacemos una busqueda de que retorne el primer resultado que encuentre
    //la condicion ingresada es que email tiene que ser igual a body.email
    //y despues colocamos un callback
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            //si hay algun error entra aqui y retorna el error con el status
            return res.status(500).json({
                ok: false,
                err
            });
        }
        //si no encuentra ningun usuario entra aqui
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(Usuario) o contraseña incorrectos'
                }
            });
        }
        //si la contraseña no coincide entra aqui
        //con el metodo compareSync lo que hacemos es verificar que la contraseña de la base de datos sea igual a la que nos mandan
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o (contraseña) incorrectos'
                }
            });
        }

        //generamos el token del usuario aqui
        //se pasa la info del usuario,
        //nuestra llave que esta declarada en el archivo config y la fecha de expiracion que esta en el mismo archivo
        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

        //retornamos el json
        res.json({
            ok: true,
            usuario: usuarioDB,
            token: token
        })
    });
});

//configuraciones de google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}
//verify().catch(console.error);

app.post('/google', async(req, res) => {
    let token = req.body.idtoken;
    console.log('soy el token' + token);
    let googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                err: 'token invalido'
            });
        });

    //Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
    //     if (err) {
    //         //si hay algun error entra aqui y retorna el error con el status
    //         return res.status(500).json({
    //             ok: false,
    //             err
    //         });
    //     };

    //     if (usuarioDB) {
    //         if (usuarioDB.google === false) {
    //             return res.status(500).json({
    //                 ok: false,
    //                 err: {
    //                     message: 'Debe de usar su autentucación normal'
    //                 }
    //             });
    //         } else {
    //             //generamos el token del usuario aqui
    //             //se pasa la info del usuario,
    //             //nuestra llave que esta declarada en el archivo config y la fecha de expiracion que esta en el mismo archivo
    //             let token = jwt.sign({
    //                 usuario: usuarioDB
    //             }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });
    //             return res.json({
    //                 ok: true,
    //                 usuario: usuarioDB,
    //                 token
    //             });
    //         }
    //     } else {
    //         //si el usuario no existe en nuestra base de datos
    //         let usuario = new Usuario();

    //         usuario.nombre = googleUser.nombre;
    //         usuario.email = googleUser.email;
    //         usuario.img = googleUser.img;
    //         usuario.google = true;
    //         usuario.password = ':)';

    //         usuario.save((err, usuarioDB) => {
    //             if (err) {
    //                 //si hay algun error entra aqui y retorna el error con el status
    //                 return res.status(500).json({
    //                     ok: false,
    //                     err
    //                 });
    //             };

    //             let token = jwt.sign({
    //                 usuario: usuarioDB
    //             }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });
    //             return res.json({
    //                 ok: true,
    //                 usuario: usuarioDB,
    //                 token
    //             });
    //         });


    //}
    //});
    // res.json({
    //     usuario: googleUser
    // });
});


module.exports = app;