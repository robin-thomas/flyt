const express = require("express");

const _ = require("lodash");
const LZUTF8 = require("lzutf8");
const path = require("path");

const parseISO = require("date-fns/parseISO");
const format = require("date-fns/format");
const parse = require("date-fns/parse");

const Swagger = require("./swagger");
const Flyt = require("./flyt");
const Utils = require("./utils");
const Contract = require("./contract");
const Scheduler = require("./scheduler");
const Cache = require("./cache");

const config = require("../config.json");

const app = express();
app.use(express.json());
app.use(express.urlencoded());

// This api is triggered after payment is completed
app.post(config.app.api.callback.path, async (req, res) => {
  let policy = decodeURIComponent(req.body.policy);
  policy = LZUTF8.decompress(policy, {inputEncoding: "Base64"});
  policy = JSON.parse(policy);

  policy.owner = "0x0000000000000000000000000000000000000000";
  policy.premium = {
    paid: false,
    amount: Contract.getWeb3().utils.toWei(
      policy.premium.amount.toString(),
      "ether"
    ),
    txHash: req.body.tx
  };
  policy.payment = {
    paid: false,
    amount: 0,
    txHash: ""
  };

  // Send the response back as kyber callback has a 10s timeout.
  res.status(200).send();

  try {
    // Add it to key-value store.
    // We are doing this so that our frontend can immediately detect callback
    // has reached the backend.
    await Cache.set(
      policy.policyId,
      policy,
      Cache.POLICY,
      5 * 60 * 1000 /* 5 minutes TTL */
    );

    // Create the policy with "dummy" owner.
    await Contract.invokeFn("createNewPolicy", false /* isPure */, policy);

    // Overwrite the policy with real owner
    // if the transaction has passed.
    const tx = await Contract.getTx(policy.premium.txHash);
    policy.owner = tx.from;
    policy.premium.paid = true;

    await Contract.invokeFn("createNewPolicy", false /* isPure */, policy);
    await Cache.delete(policy.policyId, Cache.POLICY);

    // Set up the scheduler keys.
    const schedulerKey = format(
      parseISO(policy.flight.arrivalTime),
      "yyyy-MM-dd"
    );
    const schedulerValue = await Cache.get(schedulerKey, Cache.PAYMENT);
    if (schedulerValue === undefined) {
      await Cache.set(schedulerKey, [policy.policyId], Cache.PAYMENT);
    } else {
      await Cache.set(
        schedulerKey,
        [...schedulerValue, policy.policyId],
        Cache.PAYMENT
      );
    }
  } catch (err) {
    console.error(err);
  }
});

/**
 * @swagger
 * /policy/policyId:
 *   get:
 *     description: This api is used to retrieved a Policy object given its policy ID
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: policyId
 *         description: policyId of the policy to be searched for
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Policy has been found
 *       404:
 *         description: Policy has not been found
 */
app.get(
  config.app.api.getPolicy.path.replace("{policyId}", ":policyId"),
  async (req, res) => {
    const policyId = req.params.policyId;

    let policy = await Cache.get(policyId, Cache.POLICY);
    if (policy !== undefined) {
      res.status(200).send(policy);
    } else {
      policy = await Contract.invokeFn(
        "getPolicy",
        true /* isPure */,
        policyId
      );

      // Policy doesnt exist.
      if (policy.policyId === "0") {
        res.status(404).send();
      } else {
        res.status(200).send(Utils.mapPolicyToObject(policy));
      }
    }
  }
);

/**
 * @swagger
 * /flights/search:
 *   get:
 *     description: This api is used to search for flights based on the search params
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: from
 *         description: departure airport AITA code
 *         in: query
 *         required: true
 *         type: string
 *       - name: to
 *         description: arrival airport AITA code
 *         in: query
 *         required: true
 *         type: string
 *       - name: date
 *         description: date in YYYY-MM-DD format
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Flights satisying the search criterias will be returned
 */
app.get(config.app.api.getFlightsByRoute.path, async (req, res) => {
  const from = req.query.from;
  const to = req.query.to;
  const date = req.query.date;

  const parsedDate = parse(date, "yyyy-MM-dd", new Date());

  const results = await Flyt.getFlightsByRoute(from, to, parsedDate);

  res.status(200).send(results);
});

/**
 * @swagger
 * /flight/stats:
 *   get:
 *     description: This api is used to get the latest delay/cancellation stats of a flight
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: from
 *         description: departure airport AITA code
 *         in: query
 *         required: true
 *         type: string
 *       - name: fsCode
 *         description: fsCode of the flight
 *         in: query
 *         required: true
 *         type: string
 *       - name: carrierCode
 *         description: carrierCode of the flight
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Recent stats of the flight
 */
app.get(config.app.api.getFlightStats.path, async (req, res) => {
  const from = req.query.from;
  const fsCode = req.query.fsCode;
  const carrierCode = req.query.carrierCode;

  const results = await Flyt.getFlightStats(fsCode, carrierCode, from);

  res.status(200).send(results);
});

/**
 * @swagger
 * /airport/delay:
 *   get:
 *     description: This api is used to get the latest delay rating of an airport
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: airport
 *         description: airport AITA code
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: returns the latest delay airport of the airport
 */
app.get(config.app.api.getDelayByAirport.path, async (req, res) => {
  const results = await Flyt.getDelayByAirport(req.query.airport);
  res.status(200).send(results);
});

/**
 * @swagger
 * /premium:
 *   get:
 *     description: This api is used to retrieve the premium to be paid based on search params
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: policyId
 *         description: policyId of the policy for which the premium is been calculated
 *         in: query
 *         required: true
 *         type: string
 *       - name: from
 *         description: departure airport AITA code
 *         in: query
 *         required: true
 *         type: string
 *       - name: fsCode
 *         description: fsCode of the flight
 *         in: query
 *         required: true
 *         type: string
 *       - name: carrierCode
 *         description: carrierCode of the flight
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Calculate the premium for the policy and returns. Keep retrying until premium is 0
 */
app.get(config.app.api.getPremium.path, async (req, res) => {
  const policyId = req.query.policyId;
  const from = req.query.from;
  const fsCode = req.query.fsCode;
  const carrierCode = req.query.carrierCode;

  const premium = await Flyt.getPremium(policyId, from, fsCode, carrierCode);
  res.status(200).send({premium});
});

// Generate the swagger docs.
Swagger(app);

const port = !_.isUndefined(process.env.PORT) ? process.env.PORT : 4000;
app.listen(port, () => {
  console.log(`app listening on ${port}`);

  Scheduler.scheduleJob();
});

// Export our app for testing purposes
module.exports = app;
