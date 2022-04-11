const { Schema } = require('mongoose');
const { mongoose } = require('mongoose');
const db = require('../db');
//const { User } = require('./users');
require('./users');

const CourseSchema = new Schema({

    courseId: Schema.Types.ObjectId,
    subject: {
        type: String,
        minlength: 4,
        maxlength: 4,
        uppercase: true,
        required: true,
        index: true,
    },
    number: {
        type: Number,
        validate: {
            validator: (value) => value == Math.trunc(value),
            message: '{VALUE} is not an integer'
        },
        min: 1000,
        max: 6999,
        required: true,
        index: true,
    },
    title: {
        type: String, 
        trim: true,
        maxlength: 200,
        required: false,
    },

    teacher: {
        type: Object,
        minlength: 4,
        maxlength: 24,
        required: true,
    },

    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: [],
        required: false,
        index: true,
    }]
    


}, {versionKey: false});

CourseSchema.index({ 'subject': 1, 'number': 1 }, { unique: true });

mongoose.set('toJSON', {
    virtuals: true,
    transform: (doc, converted) => {
      delete converted._id;
    }
  });
const Course = mongoose.model('Course', CourseSchema);


module.exports = { Course };





