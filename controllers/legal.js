const { response, request } = require('express');
const path = require('path');
var fs = require('fs');

const getNotice = async (req = request, res = response) => {
    console.log('Downloading legal warning...');

    var file = fs.createReadStream('./public/assets/legal/legal-warning.pdf');
    var stat = fs.statSync('./public/assets/legal/legal-warning.pdf');
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=legal-warning.pdf');
    file.pipe(res);
}


const getData = async (req = request, res = response) => {

    console.log('Downloading data privacy policy...');

    var file = fs.createReadStream('./public/assets/legal/data-privacy-policy.pdf');
    var stat = fs.statSync('./public/assets/legal/data-privacy-policy.pdf');
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=data-privacy-policy.pdf');
    file.pipe(res);

}

module.exports = {
    getNotice,
    getData
}