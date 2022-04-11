const { describe, it, expect, beforeEach } = require('@jest/globals');
const supertest = require('supertest');
require('../lib/config').logLevel = undefined;
const app = require('../lib/app');
const db = require('./db');
const { select, userToJson, courseToJson } = require('./util');

describe('Roster endpoints', () => {

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

  it('should read all users in a course', async () => {
    let res = await supertest(app)
      .get('/api/rosters/' + coursedata.bask2417.id)
      .expect(200)
      .expect('Content-Type', /^application\/json/);

    let students = [userdata.jdoe, userdata.jsoe, userdata.jslow, userdata.jblow].map(select('id', 'username'));
    expect(res.body).toStrictEqual(students);
  });

  it('should add a user to a course', async () => {
    let res = await supertest(app)
      .put(`/api/rosters/${coursedata.danc2500.id}/${userdata.jroe.id}`)
      .expect(200)
      .expect('Content-Type', /^application\/json/);

    expect(res.body).toBe(userdata.jroe.id);

    let course = await db.courses.findById(coursedata.danc2500.id);
    let students = [userdata.jdoe.id, userdata.jsoe.id, userdata.jslow.id, userdata.jroe.id];
    expect(course.students.map(String)).toStrictEqual(students);
  });

  it('should remove a user from a course', async () => {
    let res = await supertest(app)
      .delete(`/api/rosters/${coursedata.danc2500.id}/${userdata.jsoe.id}`)
      .expect(200)
      .expect('Content-Type', /^application\/json/);

    expect(res.body).toBe(userdata.jsoe.id);

    let course = await db.courses.findById(coursedata.danc2500.id);
    let students = [userdata.jdoe.id, userdata.jslow.id];
    expect(course.students.map(String)).toStrictEqual(students);
  });
});
