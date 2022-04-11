const { Schema } = require('mongoose');
const { mongoose } = require('mongoose');
const db = require('../db');

const UserSchema = new Schema({
    userId: Schema.Types.ObjectId,
    username: {
        type: String,
        match: /^[a-zA-Z\d]+$/,
        minlength: 4,
        maxlength: 20,
        unique: true,
        required: true,
        
    },
    firstname: {
        type: String,
        trim: true,
        maxlength: 100,
        require: true
    },
    lastname: {
        type: String, 
        trim: true,
        maxlength: 100,
        required: true,
    },
    email: {
        type: String,
        match: /^\w+@\w+(\.\w+)+$/,
        required: false,
        unique: true,
        index: true,
        sparse: true,
    }

}, {versionKey: false });

UserSchema.method('toClient', function() {
    var obj = this.toObject();

    //Rename fields
    obj.id = obj._id;
    delete obj._id;

    return obj;
});

const User = mongoose.model('User', UserSchema);
module.exports = { User };