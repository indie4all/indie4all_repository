const { response, request } = require('express');

const usuariosGet = (req = request, res = response) => {

    const query = req.query;

    res.json({
        msg: 'Get API - Controller',
        query
    });
}

const usuariosPost = (req, res = response) => {
    const { nombre, edad} = req.body;
    res.json({
        msg: 'Post API - Controller',
        nombre,
        edad
    });
}

const usuariosPut = (req, res = response) => {

    const id = req.params.id;

    res.json({
        msg: 'Put API - Controller',
        id
    });
}

const usuariosDelete = (req, res = response) => {
    res.json({
        msg: 'Delete API - Controller'
    });
}



module.exports = {
    usuariosGet,
    usuariosPost,
    usuariosPut,
    usuariosDelete
}