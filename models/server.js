const express = require('express');
const hbs = require('express-handlebars');
const path = require('path');
const { dbConnection } = require('../database/config');
const bodyParser = require('body-parser');
var cors = require('cors');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
require('console-stamp')(console, {
   format: ':date(yyyy/mm/dd HH:MM:ss.l) :label'
});


const handlebars = require('handlebars');


class Server {

   constructor() {
      this.app = express();
      this.port = process.env.PORT;
      this.usuariosPath = '/';
      this.userPath = '/user';
      this.unitPath = '/unit';
      this.legalPath = '/legal';

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
      this.app.use(this.unitPath, require('../routes/unit'));
      this.app.use(this.legalPath, require('../routes/legal'));

      this.app.set('views', path.join(__dirname, '../views'));
      this.app.use(express.static(path.join(__dirname, '../public')));

   }
   listen() {

      this.app.listen(this.port, () => {
         console.info('Server running on port', this.port);
      })

   }
   middlewares() {
      this.app.use(express.static('public'));

      //Cors
      this.app.use(cors());

      //Lectura y parseo de body
      //this.app.use(express.json());
      this.app.use(express.json({ limit: '100mb' }));

      //Usamos hbs para modular el proyecto
      this.app.engine('hbs', hbs({
         extname: 'hbs',
         defaultLayout: 'layout',
         layoutsDir: 'views/layouts/',
      }
      ));
      this.app.set('view engine', 'hbs');

      handlebars.registerHelper('isEqual', function (value1, value2, options) {
         if (value1 === value2) {
            return options.fn(this);
         } else {
            return options.inverse(this);
         }
      });

      //Para que nos llegue bien el body de los forms
      //this.app.use(bodyParser.urlencoded({ limit: '500mb', extended: true, parameterLimit: 1000 }));

      //this.app.use(bodyParser({limit: '50mb'}))

      this.app.use(express.urlencoded({ limit: '10mb', extended: true }));

      //this.app.use(bodyParser.json({ limit: '500mb' }));
      //this.app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));

      //Para poder setear y recoger cookies
      this.app.use(cookieParser())
   }
}
module.exports = Server;