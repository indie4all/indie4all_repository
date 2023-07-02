const { response, request } = require('express');

const home = async (req = request, res = response) => {
    //Si llego aqui es porque ya tengo token,
    //porque se ha validado con el middleware
    //que te redirige al login si no lo tienes o es invalido
    console.info('Hola, estas en el home y la ruta funciona perfectamente')
    res.render('home/index', { layout: 'layout' })
}

module.exports = {
    home
}