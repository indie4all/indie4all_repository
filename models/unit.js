const { Schema, model } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const UnitSchema = Schema({
    version: {
        type: Number,
        required: [true, 'Version is mandatory']
    },
    sections: {
        type: Schema.Types.Mixed,
        required: [true, 'Some content is needed in sections part'],
    },
    resourceId: {
        type: String,
        required: [true, 'Resource id is mandatory'],
        unique: true
    },
    title: {
        type: String,
        required: [true, 'Title is mandatory']
    },
    user: {
        type: String,
        required: [true, 'User is mandatory']
    },
    email: {
        type: String,
        required: [true, 'Email is mandatory']
    },
    institution: {
        type: String,
        required: [true, 'Institution is mandatory']
    },
    language: {
        type: String,
        required: true,
        emun: ['ES', 'EN'],
        default: 'EN'
    },
    theme: {
        type: String,
        required: [true, 'Theme is mandatory'],
        default: 'Custom'
    },
    license: {
        type: String,
        required: [true, 'License is mandatory'],
        default: 'PRIVATE'
    },
    color: {
        type: String,
        required: [true, 'Color is mandatory']
    },
    cover: {
        type: String,
    },
    mode: {
        type: String,
        required: [true, 'Mode is mandatory'],
        default: 'Local'
    },
    analytics: {
        type: Number,
        required: [true, 'Analytics is mandatory'],
        default: 0
    }
});

UnitSchema.plugin(mongoosePaginate);
module.exports = model( 'Unit', UnitSchema );