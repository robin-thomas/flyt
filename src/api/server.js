const _ = require("lodash");
const express = require("express");
const LZUTF8 = require("lzutf8");
const parseISO = require("date-fns/parseISO");
const format = require("date-fns/format");

const Utils = require("./utils");
const Contract = require("./contract");
const Scheduler = require("./scheduler");
const Cache = require("./cache");

const config = require("../config.json");

const app = express();
app.use(express.json());
app.use(express.urlencoded());

const getPolicyUrl = config.app.api.getPolicy.path.replace(
  "{policyId}",
  ":policyId"
);

app.post(config.app.api.callback.path, async (req, res) => {
  let policy = decodeURIComponent(req.body.policy);
  policy = LZUTF8.decompress(policy, { inputEncoding: "Base64" });
  policy = JSON.parse(policy);

  policy.txHash = req.body.tx;
  policy.paid = false;
  policy.owner = "0x0000000000000000000000000000000000000000";

  // Send the response back as kyber callback has a 10s timeout.
  res.status(200).send();

  try {
    // Add it to key-value store.
    // We are doing this so that our frontend can immediately detect callback
    // has reached the backend.
    await Cache.set(
      policy.policyId,
      policy,
      "policy",
      5 * 60 * 1000 /* 5 minutes TTL */
    );

    // Create the policy with "dummy" owner.
    await Contract.invokeFn("createNewPolicy", false /* isPure */, policy);

    // Overwrite the policy with real owner
    // if the transaction has passed.
    const tx = await Contract.getTx(policy.txHash);
    policy.owner = tx.from;
    policy.paid = true;

    await Contract.invokeFn("createNewPolicy", false /* isPure */, policy);

    // Set up the scheduler keys.
    const schedulerKey = format(
      parseISO(policy.flight.arrivalDate),
      "yyyy-MM-dd"
    );
    const schedulerValue = await Cache.get(schedulerKey, "payment");
    if (schedulerValue === undefined) {
      await Cache.set(schedulerKey, [policy.policyId], "payment");
    } else {
      await Cache.set(
        schedulerKey,
        [...schedulerValue, policy.policyId],
        "payment"
      );
    }
  } catch (err) {
    console.error(err);
  }
});

app.get(getPolicyUrl, async (req, res) => {
  const policyId = req.params.policyId;

  let policy = await Cache.get(policyId, "policy");
  if (policy !== undefined) {
    res.status(200).send(policy);
  } else {
    policy = await Contract.invokeFn("getPolicy", true /* isPure */, policyId);

    // Policy doesnt exist.
    if (policy.policyId === "0") {
      res.status(404).send();
    } else {
      res.status(200).send(Utils.mapPolicyToObject(policy));
    }
  }
});

const port = !_.isUndefined(process.env.PORT) ? process.env.PORT : 4000;
app.listen(port, () => {
  console.log(`app listening on ${port}`);

  Scheduler.scheduleJob();
});
