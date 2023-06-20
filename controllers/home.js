const { response, request } = require('express');

const home = async (req = request, res = response) => {
    console.log('Hola, estas en el home y la ruta funciona perfectamente')
    res.render('home/index', { layout: 'layout' })
}

module.exports = {
    home
}