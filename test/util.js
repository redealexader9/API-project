const { ObjectId } = require('mongodb');

function select(...fields) {
    return (o) => {
        let p = {};
        for (let field of fields) {
            if (field in o) {
                p[field] = o[field];
            }
        }
        return p;
    }
}

function userToJson(user) {
    if (typeof user === 'string') {
        return user;
    }
    else if (user instanceof ObjectId) {
        return user.toString();
    }
    else if (user) {
        user.id = user._id.toString();
        delete user._id;
        delete user.__v;
    }
    return user;
}

function compareUsers(a, b) {
    return a.username.localeCompare(b.username);
}

function courseToJson(course) {
    if (typeof course === 'string') {
        return course;
    }
    else if (course instanceof ObjectId) {
        return course.toString();
    }
    else if (course) {
        course.id = course._id.toString();
        delete course._id;
        delete course.__v;
        delete course.students;
        course.teacher = userToJson(course.teacher);
    }
    return course;
}

function compareCourses(a, b) {
    let diff = a.subject.localeCompare(b.subject);
    if (diff == 0) {
        return a.number - b.number;
    }
    else {
        return diff;
    }
}

module.exports = {
    select,
    userToJson,
    compareUsers,
    courseToJson,
    compareCourses,
};
