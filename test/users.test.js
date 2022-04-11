const { describe, it, expect, beforeEach } = require('@jest/globals');
const supertest = require('supertest');
require('../lib/config').logLevel = undefined;
const app = require('../lib/app');
const db = require('./db');
const { select, userToJson, compareUsers } = require('./util');

describe('Users endpoints', () => {
  let userdata;

  beforeEach(async () => {
    await db.users.insertMany([
      { username: 'jblow', firstname: 'Joe', lastname: 'Blow' },
      { username: 'jroe', firstname: 'Jane', lastname: 'Roe' },
      { username: 'jdoe', firstname: 'John', lastname: 'Doe' },
    ]);

    let users = await db.users.find({}).toArray();
    users = users.map(userToJson);
    userdata = {};
    for (let user of users) {
      userdata[user.username] = user;
    }
  });

  it('should create a user', async () => {
    let data = { username: 'jsoe', firstname: 'Just', lastname: 'Soe' };
    let res = await supertest(app)
      .post('/api/users')
      .set('Content-Type', 'application/json')
      .send(data)
      .expect(200)
      .expect('Content-Type', /^application\/json/);

    data.id = res.body.id;
    expect(res.body).toStrictEqual(data);

    let user = await db.users.findById(data.id);
    expect(userToJson(user)).toStrictEqual(data);
  });

  it('should read all users', async () => {
    let res = await supertest(app)
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /^application\/json/);

    res.body.sort(compareUsers);
    let users = Object.values(userdata).map(select('id', 'username'));
    expect(res.body).toStrictEqual(users.sort(compareUsers));
  });

  it('should read a user by username', async () => {
    let res = await supertest(app)
      .get('/api/users/jblow')
      .expect(200)
      .expect('Content-Type', /^application\/json/);
    expect(res.body).toStrictEqual(userdata.jblow);
  });

  it('should read a user by document id', async () => {
    let res = await supertest(app)
      .get('/api/users/' + userdata.jroe.id)
      .expect(200)
      .expect('Content-Type', /^application\/json/);
    expect(res.body).toStrictEqual(userdata.jroe);
  });

  it('should update a user', async () => {
    let data = { ...userdata.jdoe, username: 'jslow', firstname: 'Jog', lastname: 'Slow' };
    let res = await supertest(app)
      .put('/api/users/' + data.id)
      .send(data)
      .expect(200)
      .expect('Content-Type', /^application\/json/);
    expect(res.body).toStrictEqual(data);

    let user = await db.users.findById(data.id);
    expect(userToJson(user)).toStrictEqual(data);
  });

  it('should delete a user', async () => {
    let res = await supertest(app)
      .delete('/api/users/' + userdata.jroe.id)
      .expect(200)
      .expect('Content-Type', /^application\/json/);
    expect(res.body).toStrictEqual(userdata.jroe);

    expect(await db.users.findById(userdata.jroe.id)).toBeUndefined();
    expect(userToJson(await db.users.findById(userdata.jdoe.id))).toStrictEqual(userdata.jdoe);
    expect(userToJson(await db.users.findById(userdata.jblow.id))).toStrictEqual(userdata.jblow);
  });
});
