const { response } = require('express')
const jwt = require('jsonwebtoken');

const validateJwt = (req, res = response, next) => {

    const {token} = req.cookies;

    if(!token){
        return res.status(401).redirect('/user/sign/in');
    }

    try {
        const { uid } = jwt.verify(token, process.env.SECRET_OR_PRIVATE_KEY);
        req.uid = uid;
        next();
    } catch (error) {
        console.error(error);
        res.clearCookie('token');
        return res.status(401).redirect('/user/sign/in');
    }
}

module.exports = validateJwt;