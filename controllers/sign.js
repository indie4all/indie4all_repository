const { response, request } = require('express');
const User = require('../models/user');
const { getJwt } = require('../helpers/getJwt');
const bcryptjs = require('bcryptjs');
const { googleVerify } = require('../helpers/googleVerify');
const path = require('path');
const fs = require('fs-extra');

const getSignInPage = async (req = request, res = response) => {
    console.info('Rendering sign in page...')

    const { token } = req.cookies;
    if (token) {
        return res.redirect('/');
    }

    res.render('sign/in', { layout: 'layout' })
}

const getSignUpPage = async (req = request, res = response) => {
    console.info('Rendering sign up page...')

    const { token } = req.cookies;
    if (token) {
        return res.redirect('/');
    }
    res.render('sign/up', { layout: 'layout' })
}

const signInUser = async (req = request, res = response) => {

    const email = req.body.email;
    const user = await User.findOne({ 'email': email });

    if (!user) {
        return res.status(400).render('sign/in', {
            layout: 'layout',
            message: 'User not found'
        });
    }

    if (!user.status) {
        return res.status(400).render('sign/in', {
            layout: 'layout',
            message: 'User blocked - Contact you administrator'
        });
    }

    if (user.google) {
        return res.status(400).render('sign/in', {
            layout: 'layout',
            message: 'Please use you Google account'
        });
    }

    const validPassword = bcryptjs.compareSync(req.body.password, user.password);
    if (!validPassword) {
        return res.status(400).render('sign/in', {
            layout: 'layout',
            message: 'Email/password not correct'
        });
    }

    const token = await getJwt(user.id);

    res.cookie('token', token);

    return res.redirect('/');
}

const signUpNewUser = async (req = request, res = response) => {

    const { name, email, password } = req.body;
    const userExists = await User.findOne({ 'email': email });
    if (userExists) {
        console.info("User already registered");
        return res.render('sign/up', {
            layout: 'layout',
            message: 'User already registered'
        });
    }

    const user = new User({ name, email, password });
    const salt = bcryptjs.genSaltSync();
    user.password = bcryptjs.hashSync(password, salt);
    await user.save();

    return res.status(200).render('sign/in', {
        layout: 'layout',
        message: 'User registered successfully.'
    });

}

const getProfile = async (req = request, res = response) => {
    console.info('Rendering profile page...');

    const loggedInUser = await User.findOne({ '_id': req.uid }).lean();

    let admin = false;
    if (loggedInUser.role == 'ADMIN_ROLE') {
        admin = true;
    }

    res.render('user/profile', {
        layout: 'layout',
        admin: admin,
        loggedInUser: loggedInUser,
        google: loggedInUser.google,
    })
}

const getEditUserForm = async (req = request, res = response) => {
    console.info('Rendering edit user page...');

    const uid = req.params.id;
    const user = await User.findOne({ '_id': uid }).lean();

    res.render('user/editUser', {
        user
    });
}

const editUser = async (req = request, res = response) => {
    console.info('Editing user...');

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

    const updatedUser = {
        uid: uid,
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        status: req.body.status,
        password: req.body.password,
        image: relativeImagePath
    };

    if (originalUser.password != updatedUser.password) {
        const salt = bcryptjs.genSaltSync();
        updatedUser.password = bcryptjs.hashSync(updatedUser.password, salt);
    }

    await User.findByIdAndUpdate(uid, updatedUser).then(() => {
        res.redirect('/user/all/page');
        console.info('User edited succesfully');
    }).catch(error => {
        console.error(error);
    });

}

const getCurrentUser = async (req = request, res = response) => {

    console.info(`Retrieving current user...`);

    const loggedInUser = await User.findOne({ '_id': req.uid }).lean();

    res.json({
        currentUser: loggedInUser
    })
}

const googleSignIn = async (req = request, res = response) => {

    const { id_token } = req.body;
    try {

        const { name, email } = await googleVerify(id_token);

        let user = await User.findOne({ 'email': email })

        if (!user.google) {
            return res.status(400).json({
                msg: 'Please log in with your email and password'
            });
        }

        if (!user) {
            const userData = {
                name,
                email,
                password: ':P',
                google: true
            };
            user = new User(userData);
            await user.save()
        }

        if (!user.status) {
            return res.status(401).json({
                msg: 'User blocked - Contact you administrator'
            });
        }

        const token = await getJwt(user.id);
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

    const page = parseInt(req.query.page) || 1;
    const limit = 12;

    const { docs, totalPages } = await User.paginate({}, { page, limit });

    res.json({
        usersPerPage: docs,
        totalUsersPages: totalPages,
        currentUsersPage: page
    });
}

const deleteUser = async (req = request, res = response) => {
    console.info('Deleting user...');

    const uid = req.params.id;

    const user = await User.findByIdAndDelete(uid);

    if (user.image != '/assets/usersImgs/default-user-image.jpg') {

        const imagePath = user.image;
        const basePath = 'public';
        const completePath = path.join(basePath, imagePath);

        fs.unlink(completePath, (err) => {
            if (err) {
                console.error('Error while deleting profile image', err);
            } else {
                console.info('Profile image deleted succesfully');
            }
        });
    }

    res.json({
        user,
    });
}

const getAllUsersPage = async (req = request, res = response) => {
    console.info('Rendering all users page...');

    res.render('user/allUsers', { layout: 'layout' })
}

const getAddUserForm = async (req = request, res = response) => {
    console.info('Retrieving add new user form...');

    res.render('user/addUser', { layout: 'layout' })
}

const addNewUser = async (req = request, res = response) => {
    console.info('Adding new user...');

    const imagePath = req.file ? req.file.path : 'public\\assets\\usersImgs\\default-user-image.jpg';

    const basePath = 'public';
    const relativeImagePath = '/' + path.relative(basePath, imagePath).replace(/\\/g, '/');

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

    const user = new User(newUser);

    const salt = bcryptjs.genSaltSync();
    user.password = bcryptjs.hashSync(user.password, salt);

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
    googleSignIn,
    getAllUsers,
    deleteUser,
    getAddUserForm,
    addNewUser,
    getCurrentUser,
    getAllUsersPage,
    checkIfLogged
}