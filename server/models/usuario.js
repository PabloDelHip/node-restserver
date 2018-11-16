const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator'); //se utiliza para realizar validaciones, como el correo que sea unico, que solo permita dos tipos de roles, etc

//hacemos una validacion para los roles donde indicamos que solo se permiten dos tipos de roles y retornamos el texto que queremos que aparesca en el error
let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol valido'
}

//se utiliza para poder manipular los datos
let Schema = mongoose.Schema;

//indicamos los datos que coniene nuestra base de datos 
let usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es necesario']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'El correo es necesario']
    },
    password: {
        type: String,
        required: [true, 'la contraseña es obligatoria']
    },
    img: {
        type: String,
        required: false

    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos //llamamos a nuestra variable donde validamos los roles
    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }
});

//le indicamos que no queremos que retorne en el objeto, nada de password ni el nombre ni el valor
usuarioSchema.methods.toJSON = function() {
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;

    return userObject;
}

//manejamos el error del email, que debe de ser unico en esta parte
usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único' });

module.exports = mongoose.model('Usuario', usuarioSchema);