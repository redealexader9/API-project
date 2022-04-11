const common = require('./common');
const { Course } = require('../../models/courses');
const { User } = require('../../models/users');
const Users  = require('./users');
const { query } = require('express');
const mongoose = require('mongoose');
const { getAllUsers } = require('./users');


async function getAllCourses(req, res, next){
try{
    let courses = await Course.find( {status: "active"}, { id: 1, subject: 1, number: 1});
    res.json(courses);
}
catch(err){
    //next(err);
    console.error(err);
}
}



async function createCourse(req, res, next){
    let teacherFound;
    let teacherId = req.body.teacher;
    let length = teacherId.length;
    let isUser;
    if(length == 24){
        
        try{
            teacherFound = await User.findById(teacherId).select('-username');
            //teacherFound['id'] = teacherFound['_id'];
            //delete teacherFound['_id'];
            //teacherFound['id'] = teacherFound['_id'];
            //delete teacherFound['_id'];
        }
        catch(err){
            return common.teacherValidationFailed(req, res, teacherId);
        }
        isUser = true;
    }
    else if(length >= 4 && length <= 20){
        try{
            teacherFound = await User.findOne({ username: teacherId});
        }
        catch(err){
            return common.teacherValidationFailed(req, res, teacherId);
        }
        isUser = true;
    }
    else{
        isUser = false;
        return common.teacherValidationFailed(req, res, teacherId);
    }
    
    if(isUser == true){
        
        const course = new Course({
              subject: req.body.subject,
              number: req.body.number,
              title: req.body.title,
              teacher: teacherFound,
            });
        try{
                await course.save();
                let returnedCourse = await Course.findById(course.id).select('-students');
                returnedCourse.teacher['id'] = returnedCourse.teacher['_id'];
                delete returnedCourse.teacher['_id'];
                //let id = returnedCourse.teacher._id;
                //delete returnedCourse.teacher;
                //returnedCourse['teacher'] = id;
                return res.json(returnedCourse);
            }

        catch(err){
                console.error(err);
            }
    }
}

async function lookupCourse(req, res, next, value){
try{
    if(value.length == 24){
        let course = await Course.exists({id: value});
        if(course == null){
            return common.notFound(req, res, value);
        }
        else{
            res.locals.course = course;

        }

    }
    else if(value.length >= 4 && value.length <= 20){
        let sub = value.substring(4, 0);
        let num = value.substring(4);
        sub = sub.toUpperCase();
        let course = await Course.exists({ subject: sub, number: num });

        if(course == null){
            res.status(404);
            return res.json({message: `Course '${req.params.courseId}' not found`});
        }
        else{
            res.locals.course = await Course.exists({subject: sub, number: num});
        }
    }
    else{
        return common.notFound(req, res, next, value);
    }
    if(res.locals.course){
        if(req.method == 'DELETE'){
            return deleteCourse(req, res, next, value);
        }
        else{
            next();
        }
    }
    else{
        return common.notFound(req, res, next, value);
    }

}
catch(err){
    return res.json({message: `Course specified not found`});
    
    next(err);
}





}
    

async function findCourse(req, res, next){
try{
    let id = String(res.locals.course._id);
    let course = await Course.findById(id).select('-students');
    course.teacher['id'] = course.teacher['_id'];
    delete course.teacher['_id'];
    res.json(course);
    }

catch(err){
    return res.json({message: `Course specified not found`});
    //console.error(err);

    next(err);
}


}


async function addStudentToClass(req, res, next){
    try{
       
    let user = res.locals.user;
    let course = res.locals.course;
    course.students.push(user._id);
    await course.save();

    return res.json(user._id);
    }
    catch(err){
        console.error(err);
    }
    
    }

async function deleteCourse(req, res, next, value){
    try{
        let course;
        if(value.length == 24){
         course = await Course.findByIdAndDelete(value).select('-students');
         course.teacher['id'] = course.teacher['_id'];
         delete course.teacher['_id'];
         return res.json(course);
        }
        else if(value.length >= 4 && value.length <= 20){
            let courseNum = value.substring(4);
            let courseSub = value.substring(4, 0);
            courseSub = courseSub.toUpperCase();
            console.log(courseSub);

            course = await Course.findOneAndDelete({ number: courseNum, subject: courseSub }).select('-students');
            course.teacher['id'] = course.teacher['_id'];
            delete course.teacher['_id'];
            
           return res.json(course);
        }
        else{
            return common.notFound(req, res, value);
        }
    }
    catch(err){
        res.status(404);
        return res.json({message: `Course specified not found`});

        next(err);
    }
}

async function updateCourse(req, res, next){
    let length = req.body.teacher.length;
    let teach = req.body.teacher;
    let teacher;
    if(length < 4 || length > 20 && length != 24){
        common.teacherValidationFailed(req, res);
    }
    else if(length == 24){
        try{
            teacher = await User.findOne({ id: teach}).select(['firstname', 'lastname']);
        }
        catch(err){
           return common.teacherValidationFailed(req, res);
        }
    }
    else{
        try{
        teacher = await User.findOne({ username: teach });
        if(teacher == null){
            return common.teacherValidationFailed(req, res, teach);
        }
        }
        catch(err){
            return common.teacherValidationFailed(req, res, teach);
        }
    }
    let course = res.locals.course;
        course.subject = req.body.subject;
        course.number = req.body.number;
        course.title = req.body.title;
        course.teacher = teacher;

    try{
        await course.save();
        let newCourse = await Course.findById(course.id).select('-students');
        let id = newCourse.teacher._id;

        delete newCourse.teacher;
        newCourse['teacher'] = id;
        res.json(newCourse);
    }
    catch(err){
        next(err);
    }
}

async function getStudents(req, res, next)
{
    try{
let course = res.locals.course;
let ids = String(course.students);
ids = ids + ',';
let studentIds = [];
let comma = ids.indexOf(',');
if(comma == 0){
    return res.json({message: `No students in class specified: ${req.params.classid}`});
}
do{
studentIds.push(ids.substring(0, 24));
ids = ids.substring(25);
comma = ids.indexOf(',');
}while(comma != -1);

let studentData = [];

for(let id of studentIds){
    studentData.push(await User.findById(id).select('username'));
}

res.json(studentData);
}

    catch(err){
    next(err);
}
}

async function removeStudentFromClass(req, res, next){

try{
    let course = res.locals.course;
    let id = res.locals.user._id;
    let studentNum = course.students.indexOf(id);
if(studentNum != -1){
   let student = course.students.splice(studentNum, 1);
    await course.save();
    res.json(id);

}
else{
    res.json("Student not found");
}
}
catch(err){
    next(err);
}
}

async function getUsersClasses(req, res, next){
    let user = res.locals.user;
    let courses = await Course.find().select(['subject', 'number', 'teacher', 'students']);
    let courses2 = await Course.find().select(['subject', 'number']);
    let tempId;
    let tempCourse;
    let userCourses = [];
    let i = 0;
    let index;
    for(let course of courses2){
        tempCourse = courses[i];
        index = tempCourse.students.indexOf(user._id);
        //console.log(course);
        tempId = tempCourse.teacher._id;
        if(typeof tempId == 'object'){
        tempId = String(tempId);
        }
        
        if(tempId == user._id){

            userCourses.push(course);
        }
        if(index != -1){
            userCourses.push(course);
        }
        i++;
    }







    res.json(userCourses);
}

module.exports = { 
    getAllCourses, 
    createCourse, 
    lookupCourse, 
    deleteCourse, 
    updateCourse,
    addStudentToClass, 
    getStudents,
    removeStudentFromClass,
    findCourse,
    getUsersClasses,

};