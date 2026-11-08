process.env.NODE_ENV = 'test';
process.env.DATABASE_FILE = './data/test-tasks.db';

const fs = require('node:fs');
const path = require('node:path');
const { before, after, test } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const dbPath = path.resolve(process.env.DATABASE_FILE);
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

const app = require('../src/app');
const db = require('../src/database');

before(() => {
  db.exec('DELETE FROM tasks');
});

after(() => {
  db.close();
  for (const suffix of ['', '-shm', '-wal']) {
    if (fs.existsSync(dbPath + suffix)) fs.unlinkSync(dbPath + suffix);
  }
});

test('GET /tasks returns an array', async () => {
  const response = await request(app).get('/tasks');
  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body.data));
});

test('POST /tasks creates a task', async () => {
  const response = await request(app).post('/tasks').send({
    title: 'Finish assignment',
    description: 'Build the REST API',
    completed: false
  });
  assert.equal(response.status, 201);
  assert.equal(response.body.data.title, 'Finish assignment');
  assert.ok(response.body.data.id);
});

test('POST /tasks rejects an empty title', async () => {
  const response = await request(app).post('/tasks').send({ title: '   ' });
  assert.equal(response.status, 400);
  assert.equal(response.body.error, 'Validation failed');
});

test('GET /tasks/:id returns an existing task', async () => {
  const created = await request(app).post('/tasks').send({ title: 'Read documentation' });
  const response = await request(app).get(`/tasks/${created.body.data.id}`);
  assert.equal(response.status, 200);
  assert.equal(response.body.data.title, 'Read documentation');
});

test('PUT /tasks/:id updates a task', async () => {
  const created = await request(app).post('/tasks').send({ title: 'Old title' });
  const response = await request(app).put(`/tasks/${created.body.data.id}`).send({
    title: 'New title',
    description: 'Updated',
    completed: true
  });
  assert.equal(response.status, 200);
  assert.equal(response.body.data.title, 'New title');
  assert.equal(response.body.data.completed, true);
});

test('DELETE /tasks/:id deletes a task', async () => {
  const created = await request(app).post('/tasks').send({ title: 'Temporary task' });
  const id = created.body.data.id;
  const response = await request(app).delete(`/tasks/${id}`);
  assert.equal(response.status, 200);
  const missing = await request(app).get(`/tasks/${id}`);
  assert.equal(missing.status, 404);
});

test('invalid ID returns 400 and missing ID returns 404', async () => {
  assert.equal((await request(app).get('/tasks/abc')).status, 400);
  assert.equal((await request(app).get('/tasks/999999')).status, 404);
});
