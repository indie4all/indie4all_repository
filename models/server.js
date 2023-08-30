const express = require('express');
const hbs = require('express-handlebars');
const path = require('path');
const { dbConnection } = require('../database/config');
var cors = require('cors');
var cookieParser = require('cookie-parser');
const handlebars = require('handlebars');
require('console-stamp')(console, {
   format: ':date(yyyy/mm/dd HH:MM:ss.l) :label'
});

class Server {

   constructor() {
      this.app = express();
      this.port = process.env.PORT;
      this.usuariosPath = '/';
      this.userPath = '/user';
      this.unitPath = '/unit';

      this.dbConnect();
      this.middlewares();
      this.routes();

   }

   async dbConnect() {
      await dbConnection();
   }

   routes() {

      this.app.use(this.usuariosPath, require('../routes/home'));
      this.app.use(this.userPath, require('../routes/user'));
      this.app.use(this.unitPath, require('../routes/unit'));

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
      this.app.use(cors());
      this.app.use(express.json({ limit: '100mb' }));

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

      this.app.use(express.urlencoded({ limit: '50mb', extended: true }));

      this.app.use(cookieParser());
   }
}

module.exports = Server;