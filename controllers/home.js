const { response, request } = require('express');

const home = async (req = request, res = response) => {

    res.render('home/index', { layout: 'layout' })
}

module.exports = {
    home
}