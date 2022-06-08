const chai = require('chai');
// const request = require('supertest')('http://localhost:3000/api/v1/menuitems');
const chaiHttp = require('chai-http'); //https://www.chaijs.com/plugins/chai-http/
const app = require('../src/index');

//Assertion style
const should = chai.should();

chai.use(chaiHttp);

describe('MenuItem endpoints', function () {
  describe('GET all menu items', function () {
    it('should fetch all current menu items', function (done) {
      chai.request(app).keepOpen()
        .get('/api/v1/menuitems')
        .end(function (err, res) {
          should.exist(res.body.data);
          res.body.data.should.be.an('array');
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('GET menu items filtered by property', function () {
    it('should fetch menu items filtered by category=beef', function (done) {
      const category = 'beef';
      chai.request(app)
        .get(`/api/v1/menuitems?category=${category}`)
        .end(function (err, res) {
          should.exist(res.body.data);
          res.body.data.should.be.an('array');
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('GET one menu item', function () {
    it('should fetch one menu item', function (done) {
      const nameItem = 'Carnitas';
      chai.request(app)
        .get(`/api/v1/menuitems/${nameItem}`)
        .end(function (err, res) {
          should.exist(res.body.data);
          res.body.data.should.be.an('object');
          res.body.data.should.have.property('_id');
          res.body.data.should.have.property('name');
          res.should.have.status(200);
          done();
        });
    });

    it('should fait to fetch non existing item', function (done) {
      const nameItem = 'NegaCarnitas';
      chai.request(app)
        .get(`/api/v1/menuitems/${nameItem}`)
        .end(function (err, res) {
          should.exist(res.body.data);
          res.body.data.should.be.an('object');
          res.body.data.should.have.property('error');
          res.should.have.status(404);
          done();
        });
    });

    // Never going to happen?
    // it('should fait to fetch menu item due to bad request', function (done) {
    //   const nameItem = '';
    //   chai.request(app)
    //     .get(`/api/v1/menuitems/${nameItem}`)
    //     .end(function (err, res) {
    //       should.exist(res.body.data);
    //       res.body.data.should.be.an('object');
    //       res.body.data.should.have.property('error');
    //       res.should.have.status(400);
    //       done();
    //     });
    // });
  });

  describe('POST new item', function () {
    it('should create a new menu item', function (done) {
      const newTestMenuItem = {
        name: 'testName',
        price: 10,
        shortDescription: 'Short description',
        longDescription: 'Long description',
        imageURL: 'http://imageurl',
        units: 'test units',
        category: 'test category',
        options: '1',
        availability: 'true',
      };
      chai.request(app)
        .post('/api/v1/menuitems')
        .send(newTestMenuItem)
        .end(function (err, res) {
          should.exist(res.body.data);
          res.body.data.should.be.an('object');
          res.body.data.should.have.property('name');
          res.body.data.should.have.property('name').eq(newTestMenuItem.name);
          res.body.data.should.have.property('createdAt');
          res.body.data.should.have.property('updatedAt');
          res.should.have.status(201);
          done();
        });
    });

    it('should fail to create new item with missing properties', function (done) {
      const incompleteTestMenuItem = {
        price: 10,
        shortDescription: 'Short description',
        longDescription: 'Long description',
        imageURL: 'http://imageurl',
        units: 'test units',
        category: 'test category',
        options: '1',
        availability: 'true',
      };
      chai.request(app)
        .post('/api/v1/menuitems')
        .send(incompleteTestMenuItem)
        .end(function (err, res) {
          should.exist(res.body.data);
          res.body.data.should.be.an('object');
          res.body.data.should.have.property('error');
          res.should.have.status(400);
          done();
        });
    });
  });

  describe('DELETE one menu item', function () {
    it('should delete one menu item', function (done) {
      const menuItemToDelete = 'testName';
      chai.request(app)
        .delete(`/api/v1/menuitems/${menuItemToDelete}`)
        .end(function (err, res) {
          res.should.have.status(204);
          done();
        });
    });

    it('should fail to delete non existing item', function (done) {
      const menuItemToDelete = 'testName';
      chai.request(app)
        .delete(`/api/v1/menuitems/${menuItemToDelete}`)
        .end(function (err, res) {
          res.body.data.should.be.an('object');
          res.body.data.should.have.property('error');
          res.should.have.status(404);
          done();
        });
    });
  });

  chai.request(app).close();
});