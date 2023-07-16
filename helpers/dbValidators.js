const { Exception } = require('handlebars');
const Role = require('../models/role');
const User = require('../models/user');

const isValidRole = async (role = '') => {

    const rolExists = await Role.findOne({ role });
    if (!rolExists) {
        throw new Error(`Role ${role} does not exists`);
    }
}

const isAdminRole = async (id = '') => {

    //Retrieve the logged in user
    const user = await User.findOne({ '_id': req.uid });

    //Check if the user is admin
    if (user.role != 'ADMIN_ROLE') {
        throw new Error(`User ${user.name} is not an admin`);
    }
}

const emailExists = async (email = '') => {
    console.log('Estoy viendo si existe el usuario')
    const emailExists = await User.findOne({ '_id': req.uid}).lean();
    
    if (emailExists) {
        console.log('dentro del if');

        throw new Error(`Email: ${email}, already exists`);
    }
}

const findUserById = async (id) => {

    const userExists = await User.findById(id);
    if (!userExists) {
        throw new Error(`Id: ${id} does not exists`);
    }
}

const findUnitById = async (id) => {

    const unitExists = await Unit.findById(id);
    if (!unitExists) {
        throw new Error(`Id: ${id} does not exists`);
    }
}




module.exports = {
    isValidRole,
    emailExists,
    findUserById,
    isAdminRole,
    findUnitById
}

