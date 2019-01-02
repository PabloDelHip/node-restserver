const express = require('express');
const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');

let app = express();
let Producto = require('../models/producto');

////////////////////////
// OBETENER TODOS LOS PRODUCTOS
////////////////////////
app.get('/productos', (req, res) => {
    //traer todos los productos
    //populate: usuario categoria
    //paginado

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Producto.find({})
        .skip(desde)
        .limit(limite)
        .sort('nombre')
        .populate('usuario', 'nombre email')
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                //si hay algun error entra aqui y retorna el error con el status
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            Producto.count({}, (err, conteo) => {
                res.json({
                    ok: true,
                    productos,
                    cuantos: conteo
                });
            });

        })
});


////////////////////////
// BUSCAR PRODUCTOS de forma LIKE
////////////////////////

app.get('/productos/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i');
    Producto.find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                //si hay algun error entra aqui y retorna el error con el status
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            })
        });

});

////////////////////////
// OBETENER UN PRODUCTO POR ID
////////////////////////
app.get('/productos/:id', (req, res) => {
    //populate: usuario categoria
    let productoId = req.params.id;
    Producto.findById({ "_id": productoId })
        .populate('usuario', 'nombre email')
        .populate('categoria', 'nombre')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }


            res.json({
                ok: true,
                productoDB
            });
        });
    // Categoria.findById(id, function(err, categoriaDB) {


    // });
});


////////////////////////
// CREAR UN NUEVO PRODUCTP
////////////////////////
app.post('/productos', [verificaToken, verificaAdminRole], (req, res) => {
    //grabar el usuario
    //grabar una categoria del listado
    let body = req.body;
    //creamos una nueva categoria, mandandole los datos mediante la instancia del modelo
    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria_id,
        usuario: req.usuario._id
    });

    //guardamos el usuario con un callback
    producto.save((err, productoDB) => {
        if (err) {
            //si hay algun error entra aqui y retorna el error con el status
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            //si hay algun error entra aqui y retorna el error con el status
            return res.status(400).json({
                ok: false,
                err
            });
        }
        //si todo sale conrrectamente, regresa un JSON con los datos que se regresan en el modelo, en este caso los datos guardados
        res.json({
            ok: true,
            producto: productoDB
        });
    });
});

////////////////////////
// ACTUALIZAR UN PRODUCTO
////////////////////////
app.put('/producto/:id', (req, res) => {
    //grabar el usuario
    //grabar una categoria del listado


    let id = req.params.id;
    let body = req.body;

    let descProducto = {
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoriaId,
        usuario: body.usuarioId
    };

    Producto.findByIdAndUpdate(id, descProducto, { new: true, runValidators: true }, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });

    });
});

////////////////////////
// BORRAR UN PRODUCTO
////////////////////////
app.delete('/producto/:id', (req, res) => {
    let id = req.params.id;
    // solo un administrador puede borrar categorias
    //Categoria.findByIdAndRemove
    Producto.findByIdAndRemove(id, (err, productoBorrado) => {
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