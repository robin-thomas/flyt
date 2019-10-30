// Import the dependencies for testing
const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../../src/api/server");

const format = require("date-fns/format");

const config = require("../../src/config.json");

// Configure chai
chai.use(chaiHttp);
chai.should();

describe("Flyt", () => {
  describe("#getPolicy", () => {
    it("getPolicy() should return dummy policy for invalid policyId", done => {
      chai
        .request(app)
        .get(config.app.api.getPolicy.path.replace("{policyId}", "0"))
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    }).timeout(10000);
  });

  describe("#getFlightsByRoute", () => {
    it("Search for flights based on route", done => {
      chai
        .request(app)
        .get(config.app.api.getFlightsByRoute.path)
        .query({
          from: "SIN",
          to: "SYD",
          date: format(new Date(), "yyyy-MM-dd")
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          done();
        });
    }).timeout(10000);
  });

  describe("#getFlightStats", () => {
    it("Get flight stats based on flight identifier", done => {
      chai
        .request(app)
        .get(config.app.api.getFlightStats.path)
        .query({
          from: "SIN",
          fsCode: "MI",
          carrierCode: "468"
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          done();
        });
    }).timeout(10000);
  });

  describe("#getDelayByAirport", () => {
    it("Get delay ratings based on airport code", done => {
      chai
        .request(app)
        .get(config.app.api.getDelayByAirport.path)
        .query({
          airport: "SIN"
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          done();
        });
    }).timeout(10000);
  });

  describe("#getPremium", () => {
    it("getPremium() should return 0 for invalid policyId", done => {
      chai
        .request(app)
        .get(config.app.api.getPremium.path)
        .query({
          policyId: "12345",
          from: "SIN",
          fsCode: "MI",
          carrierCode: "468"
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          done();
        });
    }).timeout(10000);
  });
});
