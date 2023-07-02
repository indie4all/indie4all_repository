const { response, request } = require('express');
const User = require('../models/user');
const { getJwt } = require('../helpers/getJwt');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const { googleVerify } = require('../helpers/googleVerify');

const getSignInPage = async (req = request, res = response) => {
    console.info('Rendering sign in page')

    //Tengo que ver si estoy logeado -> si existe token
    const {token} = req.cookies;
    if (token){
        return res.redirect('/');
    }

    res.render('sign/in', { layout: 'layout' })
}

const getSignUpPage = async (req = request, res = response) => {
    console.info('Rendering sign up page')

    const {token} = req.cookies;
    if (token){
        return res.redirect('/');
    }
    res.render('sign/up', { layout: 'layout' })
}

const signInUser = async (req = request, res = response) => {
    console.info('Sing In User')

    //Check if email exists
    const email = req.body.email;
    const user = await User.findOne({ 'email': email });

    if (!user) {
        return res.status(400).render('sign/in', {
            layout: 'layout',
            message: 'User not found'
        });
    }
    //Check if user is active
    if (!user.status) {
        return res.status(400).render('sign/in', {
            layout: 'layout',
            message: 'User blocked - Contact you administrator'
        });
    }
    //Check password
    const validPassword = bcryptjs.compareSync(req.body.password, user.password);
    if (!validPassword) {
        return res.status(400).render('sign/in', {
            layout: 'layout',
            message: 'Email/password not correct'
        });
    }
    //Create new JWT
    const token = await getJwt(user.id);

    //Save token in cookies
    res.cookie('token', token);

    return res.render('home/index', { layout: 'layout' })
}

const signUpNewUser = async (req = request, res = response) => {
    console.info('Sign Up New User')

    //Retrieve user
    const { name, email, password } = req.body;

    //Verify if user already exists
    const userExists = await User.findOne({ 'email': email });
    if (userExists) {
        console.info("User already registered");
        return res.render('sign/up', {
            layout: 'layout',
            message: 'User already registered'
        });
    }

    //Create the new user to save it with USER_ROLE by default
    const user = new User({ name, email, password });

    //Encrypt password
    const salt = bcryptjs.genSaltSync();
    user.password = bcryptjs.hashSync(password, salt);

    //Save in the data base
    await user.save();

    return res.status(200).render('sign/in', {
        layout: 'layout',
        message: 'User registered successfully.'
    });

}

const getProfile = async (req = request, res = response) => {
    console.info('Rendering profile page')

    //Retrieve the user role
    const loggedInUser = await User.findOne({ '_id': req.uid }).lean();
    console.info(loggedInUser);

    //Check if the user is admin and have access to 'Users' tab
    let admin = false;
    if (loggedInUser.role == 'ADMIN_ROLE') {
        admin = true;
    }


    //Retrieve all the users
    const allUsers = await User.find({}).lean();

    res.render('profile/profile', {
        layout: 'layout',
        allUsers: allUsers,
        admin: admin,
        loggedInUser: loggedInUser,
        google: !loggedInUser.google
    })
}

const getEditUserForm = async (req = request, res = response) => {
    console.info('Rendering edit user page')

    const uid = req.params.id;
    const user = await User.findOne({ '_id': uid }).lean();

    res.render('editUser/editUser', {
        user
    });
}

const editUser = async (req = request, res = response) => {
    console.info('Editing user...');

    //Retrieve original user data
    const uid = req.params.id;
    const originalUser = await User.findOne({ '_id': uid }).lean();

    //Retrieve changed user data
    const updatedUser = {
        uid: uid,
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        status: req.body.status,
        password: req.body.password
    };

    //Check if password has changed
    if (originalUser.password != updatedUser.password) {
        //Encrypt password when changes
        const salt = bcryptjs.genSaltSync();
        updatedUser.password = bcryptjs.hashSync(updatedUser.password, salt);
    }

    //Save in the database
    await User.findByIdAndUpdate(uid, updatedUser).then(() => {
        res.redirect('/user/profile');
        console.info('User edited succesfully');
    }).catch(error => {
        console.error(error);
    });
}

const getUser = async (req = request, res = response) => {
    const uid = req.params.id;
    console.info('GET USER ENDPOINT' + uid);

    res.json({
        uid: uid
    })


}


const googleSignIn = async (req = request, res = response) => {
    console.info('Rendering google sin in page')

    const { id_token } = req.body;

    //Verificar id token de google

    try {

        const { name, email } = await googleVerify(id_token);
        console.log(name, email);

        //Ver si ese correo ya existe en la base de datos
        let user = await User.findOne({ 'email': email })

        if (!user) {
            //Si usuario no existe -> crearlo
            const userData = {
                name,
                email,
                password: ':P',
                google: true
            };

            user = new User(userData);
            await user.save()
        }

        //Si el usuario en DB tiene estado false

        if (!user.status) {
            return res.status(401).json({
                msg: 'User blocked - Contact you administrator'
            });
        }

        //Generar JWT
        const token = await getJwt(user.id);
        //Save token in cookies
        res.cookie('token', token);

        return res.status(200).json({
            msg: 'Google user logged in succesfully.',
        });
            
    } catch (error) {
        return res.status(500).redirect('/');
    }


}


module.exports = {
    getSignInPage,
    getSignUpPage,
    signInUser,
    signUpNewUser,
    getProfile,
    getEditUserForm,
    editUser,
    getUser,
    googleSignIn
}