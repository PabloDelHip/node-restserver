const jwt = require('jsonwebtoken');

//===================
// Verificar Token
//===================
let verificaToken = (req, res, next) => {
    //recibimos el token que nos envian(se pone el nombre que nosotros le hallamos indicado)
    let token = req.get('token');
    //verifimacamos si el token es valido
    //primero colocamos el tokend,
    //despues nuestro seed o nuestra llave
    //y por ultimo el callback donde decoded tendra toda la info del usuario
    jwt.verify(token, process.env.SEED, (err, decoded) => {
        //error 401 de no autorizacion
        if (err) {
            return res.status(401).json({
                ok: false,
                err: 'token no valido'
            });
        }
        //pasamos todos los datos mediante req para que se puedan usar en donde se haya declarado el middleware, en este caso en get/usuarios
        req.usuario = decoded.usuario;
    });
    //se pone next para que la aplicacion pueda continuar
    next();
};


//===================
// Verificar AdminRole
//===================
let verificaAdminRole = (req, res, next) => {
    let usuario = req.usuario;
    if (usuario.role != 'ADMIN_ROLE') {
        return res.json({
            ok: false,
            err: {
                message: 'El usuario no es administrador'
            }
        });

    }
    next();
}
module.exports = {
    verificaToken,
    verificaAdminRole
}