const express = require('express');
const db = require('../../db');
const config = require('../../config');
const bodyParser = require('body-parser');
const router = express.Router();
const users = require('./users');
const courses = require('./courses');
router.use(bodyParser.json());
router.param('userId', users.lookupUser);
router.put('/rosters/:classid/:userId', courses.addStudentToClass);

router.get('/users/:userId', users.findUser);
router.get('/courses/users/:userId', courses.getUsersClasses);
router.param('courseId', courses.lookupCourse);
router.delete('/courses/:courseId', courses.deleteCourse);

router.param('classid', courses.lookupCourse);
router.get('/rosters/:classid', courses.getStudents);

//router.param('userid', courses.addStudentToClass);
//router.param('userid', courses.removeStudentFromClass);
router.delete('/rosters/:classid/:userId', courses.removeStudentFromClass);
router.put('/users/:userId', users.updateUser);
router.get('/courses/:courseId', courses.findCourse);

router.put('/courses/:courseId', courses.updateCourse);
router.post('/courses', courses.createCourse);
router.get('/courses', courses.getAllCourses);

router.get('/users/', users.getAllUsers);
router.post('/users/', users.createUser);
router.delete('/users/:userId', users.deleteUser);


module.exports = { router };  