const { response, request } = require('express');
const User = require('../models/user');
const { getJwt } = require('../helpers/getJwt');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');

const getSignInPage = async (req = request, res = response) => {
    console.log('Rendering sign in page')
    res.render('sign/in', { layout: 'layout' })
}

const getSignUpPage = async (req = request, res = response) => {
    console.log('Rendering sign up page')
    res.render('sign/up', { layout: 'layout' })
}

const signInUser = async (req = request, res = response) => {
    console.log('Sing In User')

    //Check if email exists
    const email = req.body.email;
    const user = await User.findOne({ 'email': email });

    if (!user) {
        return res.status(400).json({
            msg: 'User not found'
        });
    }
    //Check if user is active
    if (!user.status) {
        return res.status(400).json({
            msg: 'User not found'
        })
    }
    //Check password
    const validPassword = bcryptjs.compareSync(req.body.password, user.password);
    if (!validPassword) {
        return res.status(400).json({
            msg: 'Email/Password not correct'
        });
    }
    //Create new JWT
    const token = await getJwt(email);

    //Save token in cookies
    res.cookie('token', token);

    return res.render('home/index', { layout: 'layout' })
}

const signUpNewUser = async (req = request, res = response) => {
    console.log('Sign Up New User')

    //Retrieve user
    const { name, email, password} = req.body;

    //Verify if user already exists
    const userExists = await User.findOne({ 'email': email });
    if(userExists){
        console.log("User already registered");
        return res.render('sign/up', { 
            layout: 'layout',
            message: 'User already registered'
        });
    }

    //Create the new user to save it with USER_ROLE by default
    const user = new User({ name, email, password});

    //Encrypt password
    const salt = bcryptjs.genSaltSync();
    user.password = bcryptjs.hashSync(password, salt);

    //Save in the data base
    await user.save();

    //return res.status(200).redirect('/user/sign/in');
    return res.status(200).render('sign/in', { 
        layout: 'layout',
        message: 'User registered successfully.'
    });

}

module.exports = {
    getSignInPage,
    getSignUpPage,
    signInUser,
    signUpNewUser
}