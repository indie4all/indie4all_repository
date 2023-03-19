const express = require('express');
var cors = require('cors');

class Server {

     constructor () {
        this.app = express();
        this.port = process.env.PORT; 
        this.usuariosPath = '/api/usuarios';

        //Aqui irán los Middlewares: funciones que siempre se ejecutan al levantar mi aplicacion
        this.middlewares();

        this.routes();
     }
     //En este metodo tendré todas las ruta de mi servidor
     routes() {

      this.app.use(this.usuariosPath, require('../routes/usuarios'));

     }
     listen(){

        this.app.listen(this.port, () => {
            console.log('Servidor corriendo en el puerto', this.port);
          })

     }
     middlewares() {
        this.app.use(express.static('public'));

        //Cors
        this.app.use( cors() );

        //Lectura y parseo de body
        this.app.use( express.json() );

     }
}
module.exports = Server;