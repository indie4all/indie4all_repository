const { Schema, model } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const UserSchema = Schema({
    name: {
        type: String,
        required: [true, 'User Name is mandatory']
    },
    email: {
        type: String,
        required: [true, 'User Email is mandatory'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'User Password is mandatory'],
    },
    role: {
        type: String,
        required: true,
        emun: ['ADMIN_ROLE', 'USER_ROLE'],
        default: 'USER_ROLE'
    },
    status: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    },
    image: {
        type: String
    }
});



UserSchema.methods.toJSON = function() {
    const { __v, password, _id, ...user  } = this.toObject();
    user.uid = _id;
    return user;
}

UserSchema.plugin(mongoosePaginate);
module.exports = model( 'User', UserSchema );
