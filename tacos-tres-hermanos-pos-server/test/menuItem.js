const chai = require('chai');
// const request = require('supertest')('http://localhost:3000/api/v1/menuitems');
const chaiHttp = require('chai-http'); //https://www.chaijs.com/plugins/chai-http/
const app = require('../src/index');

//Assertion style
const should = chai.should();

// COSTANTS
const API_URI = '/api/v1/menuitems';

chai.use(chaiHttp);

describe('MenuItem endpoints', function () {
  describe('GET all menu items', function () {
    it('should fetch all current menu items', function (done) {
      chai.request(app).keepOpen()
        .get(API_URI)
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
        .get(`${API_URI}?category=${category}`)
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
        .get(`${API_URI}/${nameItem}`)
        .end(function (err, res) {
          should.exist(res.body.data);
          res.body.data.should.be.an('object');
          res.body.data.should.have.property('_id');
          res.body.data.should.have.property('name');
          res.should.have.status(200);
          done();
        });
    });

    it('should not fetch a non existing item', function (done) {
      const nameItem = 'NegaCarnitas';
      chai.request(app)
        .get(`${API_URI}/${nameItem}`)
        .end(function (err, res) {
          should.exist(res.body.data);
          res.body.data.should.be.an('object');
          res.body.data.should.have.property('error');
          res.should.have.status(404);
          done();
        });
    });

    // Never going to happen?
    // it('should fail to fetch menu item due to bad request', function (done) {
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
        .post(API_URI)
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

    it('should not create a new item with missing properties', function (done) {
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
        .post(API_URI)
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

  describe('PATCH one menu item', function () {
    it('should update one menu item', function (done) {
      const menuItemToUpdate = 'testName';
      const dataToUpdate = {
        price: 20,
        availability: 'false',
      };
      chai.request(app)
        .patch(`${API_URI}/${menuItemToUpdate}`)
        .send(dataToUpdate)
        .end(function (err, res) {
          should.exist(res.body.data);
          res.body.data.should.be.an('object');
          res.body.data.should.have.property('price').eq(dataToUpdate.price);
          res.should.have.status(200);
          done();
        });
    });

    it("should not update one menu item's name to an existing name", function (done) {
      const menuItemToUpdate = 'testName';
      const dataToUpdate = {
        name: 'Carnitas',
        price: 20,
        availability: 'false',
      };
      chai.request(app)
        .patch(`${API_URI}/${menuItemToUpdate}`)
        .send(dataToUpdate)
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

    it('should not delete a non existing item', function (done) {
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