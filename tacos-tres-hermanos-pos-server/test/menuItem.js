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

  describe('GET one menu item', function () {
    it('should fetch one menu item', function (done) {
      chai.request(app)
        .get('/api/v1/menuitems/Carnitas')
        .end(function(err, res) {
          should.exist(res.body.data);
          res.body.data.should.be.an('object');
          res.should.have.status(200);
          done();
        });
    });
  });
});