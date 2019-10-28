const express = require("express");

const _ = require("lodash");
const LZUTF8 = require("lzutf8");

const parseISO = require("date-fns/parseISO");
const format = require("date-fns/format");
const parse = require("date-fns/parse");

const Flyt = require("./flyt");
const Utils = require("./utils");
const Contract = require("./contract");
const Scheduler = require("./scheduler");
const Cache = require("./cache");

const config = require("../config.json");

const app = express();
app.use(express.json());
app.use(express.urlencoded());

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

app.get(config.app.api.getFlightsByRoute.path, async (req, res) => {
  const from = req.query.from;
  const to = req.query.to;
  const date = req.query.date;

  const parsedDate = parse(date, "yyyy-MM-dd", new Date());

  const results = await Flyt.getFlightsByRoute(from, to, parsedDate);

  res.status(200).send(results);
});

app.get(config.app.api.getFlightStats.path, async (req, res) => {
  const from = req.query.from;
  const fsCode = req.query.fsCode;
  const carrierCode = req.query.carrierCode;

  const results = await Flyt.getFlightStats(fsCode, carrierCode, from);

  res.status(200).send(results);
});

app.get(config.app.api.getDelayByAirport.path, async (req, res) => {
  const results = await Flyt.getDelayByAirport(req.query.airport);
  res.status(200).send(results);
});

app.get(config.app.api.getPremium.path, async (req, res) => {
  const policyId = req.query.policyId;
  const from = req.query.from;
  const fsCode = req.query.fsCode;
  const carrierCode = req.query.carrierCode;

  const premium = await Flyt.getPremium(policyId, from, fsCode, carrierCode);
  res.status(200).send({premium});
});

const port = !_.isUndefined(process.env.PORT) ? process.env.PORT : 4000;
app.listen(port, () => {
  console.log(`app listening on ${port}`);

  Scheduler.scheduleJob();
});
