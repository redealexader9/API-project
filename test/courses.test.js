const { describe, it, expect } = require('@jest/globals');
const supertest = require('supertest');
require('../lib/config').logLevel = undefined;
const app = require('../lib/app');
const db = require('./db');
const { select, userToJson, compareUsers, courseToJson, compareCourses } = require('./util');

describe('Course endpoints', () => {
  let userdata, coursedata;

  beforeEach(async () => {
    await db.users.insertMany([
      { username: 'jblow', firstname: 'Joe', lastname: 'Blow' },
      { username: 'jroe', firstname: 'Jane', lastname: 'Roe' },
      { username: 'jdoe', firstname: 'John', lastname: 'Doe' },
      { username: 'jsoe', firstname: 'Just', lastname: 'Soe' },
      { username: 'jslow', firstname: 'Jog', lastname: 'Slow' },
    ]);

    let users = await db.users.find({}).toArray();
    userdata = {};
    for (let user of users) {
      userdata[user.username] = user;
    }

    await db.courses.insertMany([
      { subject: 'BASK', number: 2417, title: "Underwater Basket Weaving",
        teacher: userdata.jroe._id,
        students: [userdata.jdoe._id, userdata.jsoe._id, userdata.jslow._id, userdata.jblow._id],
      },
      { subject: 'DANC', number: 2500, title: "Square Dancing",
        teacher: userdata.jblow._id,
        students: [userdata.jdoe._id, userdata.jsoe._id, userdata.jslow._id],
      },
      { subject: 'COOK', number: 3888, title: "Advanced Waffles",
        teacher: userdata.jroe._id,
        students: [userdata.jdoe._id, userdata.jsoe._id, userdata.jslow._id, userdata.jblow._id],
      }
    ]);

    let courses = await db.courses.find({}).toArray();
    courses = courses.map(courseToJson);
    coursedata = {};
    for (let course of courses) {
      coursedata[course.subject.toLowerCase() + course.number] = course;
    }

    users = users.map(userToJson);
    for (let user of users) {
      userdata[user.username] = user;
    }
  });

  it('should create a course', async () => {
    let data = { subject: 'FRED', number: 1550, title: "Freds Throughout History", teacher: userdata.jblow.id };
    let res = await supertest(app)
      .post('/api/courses')
      .set('Content-Type', 'application/json')
      .send(data)
      .expect(200)
      .expect('Content-Type', /^application\/json/);

    data.id = res.body.id;
    let teacher = select('id', 'firstname', 'lastname')(userdata.jblow);
    expect(res.body).toStrictEqual({ ...data, teacher });

    let course = await db.courses.findById(data.id);
    expect(courseToJson(course)).toStrictEqual(data);
  });

  it('should read all courses', async () => {
    let res = await supertest(app)
      .get('/api/courses')
      .expect(200)
      .expect('Content-Type', /^application\/json/);

    res.body.sort(compareCourses);
    let courses = Object.values(coursedata).map(select('id', 'subject', 'number'));
    expect(res.body).toStrictEqual(courses.sort(compareCourses));
  });

  it('should read all courses for a user', async () => {
    let res = await supertest(app)
      .get('/api/courses/users/' + userdata.jblow.id)
      .expect(200)
      .expect('Content-Type', /^application\/json/);

    res.body.teacher.sort(compareCourses);
    res.body.students.sort(compareCourses);
    let teacher = [coursedata.danc2500].map(select('id', 'subject', 'number')).sort(compareCourses);
    let students = [coursedata.bask2417, coursedata.cook3888].map(select('id', 'subject', 'number')).sort(compareCourses);
    expect(res.body).toStrictEqual({ teacher, students });
  });

  it('should read a course by coursename', async () => {
    let res = await supertest(app)
      .get('/api/courses/' + coursedata.cook3888.subject + coursedata.cook3888.number)
      .expect(200)
      .expect('Content-Type', /^application\/json/);
    let teacher = select('id', 'firstname', 'lastname')(userdata.jroe);
    expect(res.body).toStrictEqual({ ...coursedata.cook3888, teacher });
  });

  it('should read a course by document id', async () => {
    let res = await supertest(app)
      .get('/api/courses/' + coursedata.bask2417.id)
      .expect(200)
      .expect('Content-Type', /^application\/json/);
    let teacher = select('id', 'firstname', 'lastname')(userdata.jroe);
    expect(res.body).toStrictEqual({ ...coursedata.bask2417, teacher });
  });

  it('should update a course', async () => {
    let data = { ...coursedata.danc2500, subject: 'NUMS', number: 1000, title: 'Counting to One Hundred' };
    let teacher = select('id', 'firstname', 'lastname')(userdata.jblow);
    let res = await supertest(app)
      .put('/api/courses/' + data.id)
      .send(data)
      .expect(200)
      .expect('Content-Type', /^application\/json/);
    expect(res.body).toStrictEqual({ ...data, teacher });

    let course = await db.courses.findById(data.id);
    expect(courseToJson(course)).toStrictEqual(data);
  });

  it('should delete a course', async () => {
    let teacher = select('id', 'firstname', 'lastname')(userdata.jroe);
    let res = await supertest(app)
      .delete('/api/courses/' + coursedata.bask2417.id)
      .expect(200)
      .expect('Content-Type', /^application\/json/);
    expect(res.body).toStrictEqual({ ...coursedata.bask2417, teacher });

    expect(await db.courses.findById(coursedata.bask2417.id)).toBeUndefined();
    expect(courseToJson(await db.courses.findById(coursedata.danc2500.id))).toStrictEqual(coursedata.danc2500);
    expect(courseToJson(await db.courses.findById(coursedata.cook3888.id))).toStrictEqual(coursedata.cook3888);
  });
});
