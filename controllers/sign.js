const { response, request } = require('express');
const User = require('../models/user');
const { getJwt } = require('../helpers/getJwt');

const getSignInPage = async (req = request, res = response) => {
    console.log('Hola, estas en el sign in y la ruta funciona perfectamente')
    res.render('sign/in', { layout: 'layout' })

}

const getSignUpPage = async (req = request, res = response) => {
    console.log('Hola, estas en el sign up y la ruta funciona perfectamente')
    res.render('sign/up', { layout: 'layout' })

}

const signInUser = async (req = request, res = response) => {
    console.log('Sing In User')

    const email = req.body.email;
    const password = req.body.password;

    //Actions:
    //Check if email exists
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({
            msg: 'User not found'
        });
    }
    //Check if user is active
    if (!user.estado) {
        return res.status(400).json({
            msg: 'User not found'
        })
    }
    //Check password
    const validPassword = bcryptjs.compareSync(password, user.password);
    if (!validPassword) {
        return res.status(400).json({
            msg: 'Password is not correct'
        });
    }
    //Create new JWT
    const token = await getJwt(user.id);
    res.json({
        usuario,
        token
    })
}

const signUpNewUser = async (req = request, res = response) => {
    console.log('Sign Up New User')

}

module.exports = {
    getSignInPage,
    getSignUpPage,
    signInUser,
    signUpNewUser
}