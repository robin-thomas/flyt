// Import the dependencies for testing
const chai = require("chai");
const chaiHttp = require("chai-http");
const sinon = require("sinon");

const format = require("date-fns/format");
const yesterday = require("date-fns/startOfYesterday");

const app = require("../../src/api/server");

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
      const flyt = require("../../src/api/flyt");
      const stub = sinon.stub(flyt, "getFlightsByRoute");
      stub.withArgs("SIN", "SYD", sinon.match.any).returns([]);

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
      const flyt = require("../../src/api/flyt");
      const stub = sinon.stub(flyt, "getFlightStats");
      stub.withArgs("MI", "468", "SIN").returns({});

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
      const flyt = require("../../src/api/flyt");
      const stub = sinon.stub(flyt, "getDelayByAirport");
      stub.withArgs("SIN").returns({});

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

  describe("Flyt", () => {
    describe("#calculatePayment", () => {
      it("calculate payment calculates the correct amount", async () => {
        const policy = {
          policyId: "1",
          products: config.app.policy,
          flight: {
            from: "SIN",
            to: "COK",
            departureTime: `${format(yesterday(), "yyyy-MM-dd")}T20:20:00.000`,
            arrivalTime: `${format(yesterday(), "yyyy-MM-dd")}T22:05:00.000`,
            code: "MI 468"
          }
        };

        const contract = require("../../src/api/contract");
        const contractStub = sinon.stub(contract, "invokeFn");
        contractStub
          .withArgs("getPolicy", true, policy.policyId)
          .returns(policy);

        const flyt = require("../../src/api/flyt");
        const flyStub = sinon.stub(flyt, "getFlightStatus");
        flyStub.withArgs("SIN").returns({});

        const payment = await flyt.calculatePayment(policy.policyId);

        chai.assert.isNumber(payment);
      });
    });
  });
});
