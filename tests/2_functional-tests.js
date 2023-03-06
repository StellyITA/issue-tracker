const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const secretPath = process.env.SECRET_PATH;
const mongoose = require('mongoose');

chai.use(chaiHttp);

let idToDelete;

suite('Functional Tests', function() {
  test("all fields POST request to /api/issues/{project}", (done) => {
    let input = {
      issue_title: 'test',
      issue_text: 'test',
      created_by: 'test',
      assigned_to: 'test',
      status_text: 'test'
    }
    chai.request(server)
    .post("/api/issues/:project")
    .send(input)
    .end((err,res) => {
      assert.equal(res.status, 200, "Status");
      assert.equal(res.body.issue_title,input.issue_title);
      assert.equal(res.body.issue_text,input.issue_text);
      assert.equal(res.body.created_by,input.created_by);
      assert.equal(res.body.assigned_to,input.assigned_to);
      assert.equal(res.body.status_text,input.status_text);
      idToDelete = res.body._id;
      if (err) return done(err);
      done();
    })
  })
  test("required fields only POST request to /api/issues/{project}", (done) => {
    let input = {
      issue_title: 'Agvzzz',
      issue_text: 'Non ha il pulsante, ha la manopola',
      created_by: 'Ayeye Brazov'
    };
    chai.request(server)
    .post("/api/issues/:project")
    .send(input)
    .end((err,res) => {
      assert.equal(res.body.issue_title, input.issue_title);
      assert.equal(res.body.issue_text, input.issue_text);
      assert.equal(res.body.created_by, input.created_by);
      if (err) return done(err);
      done();
    })
  });
  test("missing required fields POST request to /api/issues/{project}", (done) => {
    chai.request(server)
    .post("/api/issues/:project")
    .send({
      assigned_to: 'test',
      status_text: 'test'
    })
    .end((err,res) => {
      assert.equal(Object.keys(res.body)[0], "error");
      assert.equal(Object.values(res.body)[0], "required field(s) missing");
      if (err) return done(err);
      done();
    })
  });
  test("GET request to /api/issues/{project}", (done) => {
    chai.request(server)
    .get(secretPath)
    .end((err,res) => {
      assert.equal(res.body.length, 0);
      if (err) return done(err);
      done();
    })
  });
  test("one filter GET request to /api/issues/{project}", (done) => {
    chai.request(server)
    .get(secretPath)
    .query({ open: true })
    .end((err,res) => {
      assert.equal(res.body.length, 0);
      if (err) return done(err);
      done();
    })
  });
  test("multiple filters GET request to /api/issues/{project}", (done) => {
    chai.request(server)
    .get(secretPath)
    .query({
      open: true,
      assigned_to: "sit"
    })
    .end((err,res) => {
      assert.equal(res.body.length, 0);
      if (err) return done(err);
      done();
    })
  });
  test("update one field PUT request to /api/issues/{project}", (done) => {
    chai.request(server)
    .put("/api/issues/:project")
    .send({
      _id: "64064e055cbfddc8d700c3a4",
      assigned_to: "edit: test"
    })
    .end((err,res) => {
      assert.equal(res.body.result,"successfully updated");
      assert.equal(res.body._id,"64064e055cbfddc8d700c3a4");
      if (err) return done(err);
      done();
    })
  });
  test("update multiple fields PUT request to /api/issues/{project}", (done) => {
    chai.request(server)
    .put(secretPath)
    .send({
      _id: "64064e055cbfddc8d700c3a4",
      status_text: "edit: lorem ipsum",
      assigned_to: "Joe"
    })
    .end((err,res) => {
      assert.equal(res.body.result,"successfully updated");
      assert.equal(res.body._id,"64064e055cbfddc8d700c3a4");
      if (err) return done(err);
      done();
    })
  });
  test("missing _id PUT request to /api/issues/{project}", (done) => {
    chai.request(server)
    .put("/api/issues/:project")
    .send({
      _id: "",
      issue_text: "edit: lorem ipsum",
      assigned_to: "Joe"
    })
    .end((err,res) => {
      assert.equal(Object.keys(res.body)[0],"error");
      assert.equal(res.body.error,"missing _id");
      if (err) return done(err);
      done();
    })
  });
  test("no fields PUT request to /api/issues/{project}", (done) => {
    chai.request(server)
    .put("/api/issues/:project")
    .send({
      _id: "64064e055cbfddc8d700c3a4",
    })
    .end((err,res) => {
      assert.equal(Object.keys(res.body).toString(),"error,_id");
      assert.equal(Object.values(res.body).toString(),"no update field(s) sent,64064e055cbfddc8d700c3a4");
      if (err) return done(err);
      done();
    })
  });
  test("invalid _id PUT request to /api/issues/{project}", (done) => {
    chai.request(server)
    .put("/api/issues/:project")
    .send({
      _id: "bad _id",
      issue_text: "test"
    })
    .end((err,res) => {
      assert.equal(Object.keys(res.body).toString(),"error,_id");
      assert.equal(Object.values(res.body).toString(),"could not update,bad _id");
      if (err) return done(err);
      done();
    })
  });
  test("DELETE request to /api/issues/{project}", (done) => {
    chai.request(server)
    .delete("/api/issues/:project")
    .send({
      _id: idToDelete,
    })
    .end((err,res) => {
      assert.equal(Object.keys(res.body).toString(),"result,_id");
      if (err) return done(err);
      done();
    })
  });
  test("invalid _id DELETE request to /api/issues/{project}", (done) => {
    chai.request(server)
    .delete("/api/issues/:project")
    .send({
      _id: "bad _id",
    })
    .end((err,res) => {
      assert.equal(res.body.error,"could not delete");
      if (err) return done(err);
      done();
    })
  });
  test("missing _id DELETE request to /api/issues/{project}", (done) => {
    chai.request(server)
    .delete("/api/issues/:project")
    .send({
      _id: "",
    })
    .end((err,res) => {
      assert.equal(res.body.error, "missing _id");
      if (err) return done(err);
      done();
    })
  });
  after(() => {
    chai.request(server);
  })
})
