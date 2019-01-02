const mongoose = require('mongoose');
//se utiliza para poder manipular los datos
let Schema = mongoose.Schema;

//indicamos los datos que coniene nuestra base de datos 
let categoriaSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es necesario'],
        unique: true,
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    estado: {
        type: Boolean,
        default: true
    },
});

module.exports = mongoose.model('Categoria', categoriaSchema);