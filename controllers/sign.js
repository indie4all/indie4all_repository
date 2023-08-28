const { response, request } = require('express');
const User = require('../models/user');
const { getJwt } = require('../helpers/getJwt');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const { googleVerify } = require('../helpers/googleVerify');
const axios = require('axios');
const path = require('path');

const getSignInPage = async (req = request, res = response) => {
    console.info('Rendering sign in page')

    //Tengo que ver si estoy logeado -> si existe token
    const { token } = req.cookies;
    if (token) {
        return res.redirect('/');
    }

    res.render('sign/in', { layout: 'layout' })
}

const getSignUpPage = async (req = request, res = response) => {
    console.info('Rendering sign up page')

    const { token } = req.cookies;
    if (token) {
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

    //return res.render('home/index', { layout: 'layout' })
    return res.redirect('/');
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
    console.info('Rendering profile page');

    console.log(req.uid);

    //Retrieve the user role
    const loggedInUser = await User.findOne({ '_id': req.uid }).lean();

    console.log(loggedInUser);

    //Check if the user is admin and have access to 'Users' tab
    let admin = false;
    if (loggedInUser.role == 'ADMIN_ROLE') {
        admin = true;
    }

    //Retrieve all the users
    //const allUsers = await User.find({}).lean();

    res.render('user/profile', {
        layout: 'layout',
        //allUsers: allUsers,
        admin: admin,
        loggedInUser: loggedInUser,
        google: !loggedInUser.google,
    })
}

const getEditUserForm = async (req = request, res = response) => {
    console.info('Rendering edit user page')

    const uid = req.params.id;
    const user = await User.findOne({ '_id': uid }).lean();

    res.render('user/editUser', {
        user
    });
}

const editUser = async (req = request, res = response) => {
    console.info('Editing user...');

    //Retrieve original user data
    const uid = req.params.id;
    const originalUser = await User.findOne({ '_id': uid }).lean();

    const imagePath = req.file ? req.file.path : 'public\\assets\\usersImgs\\default-user-image.jpg';

    const basePath = 'public';
    
    let relativeImagePath;
    if (!req.file) {

        relativeImagePath = originalUser.image;

    } else {
        relativeImagePath = '/' + path.relative(basePath, imagePath).replace(/\\/g, '/');
    }

    //Retrieve changed user data
    const updatedUser = {
        uid: uid,
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        status: req.body.status,
        password: req.body.password,
        image: relativeImagePath
    };

    //Check if password has changed
    if (originalUser.password != updatedUser.password) {
        //Encrypt password when changes
        const salt = bcryptjs.genSaltSync();
        updatedUser.password = bcryptjs.hashSync(updatedUser.password, salt);
    }

    //Save in the database
    await User.findByIdAndUpdate(uid, updatedUser).then(() => {
        res.redirect('/user/all/page');
        console.info('User edited succesfully');
    }).catch(error => {
        console.error(error);
    });

}

const getUser = async (req = request, res = response) => {
    const uid = req.params.id;

    res.json({
        uid: uid
    })
}

const getCurrentUser = async (req = request, res = response) => {

    console.info(`Retrieving current user...`);
    //Retrieve the user role

    console.log(req.uid);
    const loggedInUser = await User.findOne({ '_id': req.uid }).lean();

    console.log(loggedInUser);

    res.json({
        currentUser: loggedInUser
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

const getAllUsers = async (req = request, res = response) => {
    console.info('Getting all the users...');

    //Retreieve page number from params
    const page = parseInt(req.query.page) || 1;
    const limit = 12;

    const { docs, totalDocs, totalPages } = await User.paginate({}, { page, limit });

    //Retrieve paginated users
    res.json({
        usersPerPage: docs,
        totalUsersPages: totalPages,
        currentUsersPage: page
    });
}

const deleteUser = async (req = request, res = response) => {
    console.info('Deleting user...');

    const uid = req.params.id;
    console.log('Me llega el uid siguiente: ' + uid);

    const user = await User.findByIdAndDelete(uid);

    res.json({
        user,
    });
}
const getAllUsersPage = async (req = request, res = response) => {
    console.info('Rendering all users page...');

    res.render('user/allUsers', { layout: 'layout' })
}
const getAddUserForm = async (req = request, res = response) => {
    console.info('Retrieving form to add new user...');

    res.render('user/addUser', { layout: 'layout' })
}




const addNewUser = async (req = request, res = response) => {
    console.info('Adding new user...');

    const imagePath = req.file ? req.file.path : 'public\\assets\\usersImgs\\default-user-image.jpg';

    const basePath = 'public';
    const relativeImagePath = '/' + path.relative(basePath, imagePath).replace(/\\/g, '/');
    console.log(relativeImagePath);

    const newUser = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        status: req.body.status,
        password: req.body.password,
        image: relativeImagePath
    };

    const emailExists = await User.findOne({ 'email': newUser.email });


    if (emailExists) {
        if (emailExists.status) {
            res.render('user/addUser', {
                layout: 'layout',
                message: 'User already exists',
                error: true
            });
        } else {
            res.render('user/addUser', {
                layout: 'layout',
                message: 'User already exists but it is blocked',
                error: true
            });
        }
    }

    //Create the new user to save it with USER_ROLE by default
    const user = new User(newUser);

    //Encrypt password
    const salt = bcryptjs.genSaltSync();
    user.password = bcryptjs.hashSync(user.password, salt);

    //Save in the database
    await user.save().then(() => {
        res.render('user/allUsers', {
            layout: 'layout',
            message: 'User added correctly',
            error: false
        });
        console.info('User added correctly');
    }).catch(error => {
        console.error(error);
    });
}

const checkIfLogged = async (req = request, res = response) => {
    console.info('Checking if there is any user logged in...');

    const { token } = req.cookies;

    //Check if token exists
    if (token) {
        res.json({
            isLoggedIn: true
        });
    } else {
        res.json({
            isLoggedIn: false
        });
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
    googleSignIn,
    getAllUsers,
    deleteUser,
    getAddUserForm,
    addNewUser,
    getCurrentUser,
    getAllUsersPage,
    checkIfLogged
}