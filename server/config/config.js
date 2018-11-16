//===================
//Puerto
//===================
process.env.PORT = process.env.PORT || 3000;

//===================
//Entorno
//===================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//===================
//Bade de datos
//===================
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe'
} else {
    urlDB = 'mongodb://cafe_user:g4rrones@ds163226.mlab.com:63226/cafe_db';
}
process.env.URLDB = urlDB;