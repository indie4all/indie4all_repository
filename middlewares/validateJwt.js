const { response } = require('express')
const jwt = require('jsonwebtoken');

const validateJwt = (req, res = response, next) => {

    //Retrieve token
    const {token} = req.cookies;

    //Check if token exists
    if(!token){
        return res.status(401).redirect('/user/sign/in');
    }

    //Verify token
    try {
        const {email} = jwt.verify(token, process.env.SECRET_OR_PRIVATE_KEY);
        req.email = email;
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).redirect('/user/sign/in');
    }
}

module.exports = validateJwt;