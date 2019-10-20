const _ = require("lodash");
const express = require("express");
const LZUTF8 = require("lzutf8");
const Keyv = require("keyv");

const Utils = require("./utils");
const Contract = require("./contract");
const config = require("../config.json");

const keyv = new Keyv();

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

  // Send the response back as kyber callback has a 10s timeout.
  res.status(200).send();

  try {
    // Add it to key-value store.
    // We are doing this so that our frontend can immediately detect callback
    // has reached the backend.
    await keyv.set(policy.policyId, policy, 5 * 60 * 1000 /* 5 minutes TTL */);

    // Create the policy with "dummy" owner.
    await Contract.invokeFn("createNewPolicy", false /* isPure */, policy);

    // Overwrite the policy with real owner.
    const tx = await Contract.getTx(policy.txHash);
    policy.owner = tx.from;
    await Contract.invokeFn("createNewPolicy", false /* isPure */, policy);
  } catch (err) {
    console.error(err);
  }
});

app.get(getPolicyUrl, async (req, res) => {
  const policyId = req.params.policyId;

  let policy = await keyv.get(policyId);
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
app.listen(port, () => console.log(`app listening on ${port}`));
