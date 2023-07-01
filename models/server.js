const express = require('express');
const hbs = require('express-handlebars');
const path = require('path');
const { dbConnection } = require('../database/config');
const bodyParser = require('body-parser');
var cors = require('cors');
var cookieParser = require('cookie-parser')

class Server {

   constructor() {
      this.app = express();
      this.port = process.env.PORT;
      this.usuariosPath = '/';
      this.userPath = '/user'
      //this.profilePath = '/profile'

      this.dbConnect();

      //Aqui irán los Middlewares: funciones que siempre se ejecutan al levantar mi aplicacion
      this.middlewares();

      this.routes();
   }

   async dbConnect() {
      await dbConnection();
   }

   //En este metodo tendré todas las ruta de mi servidor
   routes() {

      this.app.use(this.usuariosPath, require('../routes/home'));
      this.app.use(this.userPath, require('../routes/user'));
      this.app.set('views', path.join(__dirname, '../views'));
      this.app.use(express.static(path.join(__dirname, '../public')));

   }
   listen() {

      this.app.listen(this.port, () => {
         console.log('Server running on port', this.port);
      })

   }
   middlewares() {
      this.app.use(express.static('public'));

      //Cors
      this.app.use(cors());

      //Lectura y parseo de body
      this.app.use(express.json());

      //Usamos hbs para modular el proyecto
      this.app.engine('hbs', hbs({
         extname: 'hbs',
         defaultLayout: 'layout',
         layoutsDir: 'views/layouts/',
      }
      ));
      this.app.set('view engine', 'hbs');

      //Para que nos llegue bien el body de los forms
      this.app.use(bodyParser.urlencoded({ limit: '5000mb', extended: true, parameterLimit: 100000000000 }));

      //Para poder setear y recoger cookies
      this.app.use(cookieParser())
   }
}
module.exports = Server;