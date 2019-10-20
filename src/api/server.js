const _ = require("lodash");
const express = require("express");
const LZUTF8 = require("lzutf8");

const Contract = require("./contract");
const config = require("../config.json");

const app = express();
app.use(express.json());
app.use(express.urlencoded());

app.post(config[config.app].api.callback.path, async (req, res) => {
  let policy = decodeURIComponent(req.body.policy);
  policy = LZUTF8.decompress(policy, { inputEncoding: "Base64" });
  policy = JSON.parse(policy);

  policy.txHash = req.body.tx;

  // Create the policy with "dummy" owner.
  await Contract.invokeFn("createNewPolicy", false /* isPure */, policy);

  // Overwrite the policy with real owner.
  const tx = await Contract.getTx(policy.txHash);
  policy.owner = tx.from;
  await Contract.invokeFn("createNewPolicy", false /* isPure */, policy);

  res.status(200).send();
});

const getPolicyUrl = config[config.app].api.policy.path.replace(
  "{policyId}",
  ":policyId"
);
app.get(getPolicyUrl, async (req, res) => {
  const policyId = req.params.policyId;

  const policy = await Contract.invokeFn(
    "getPolicy",
    true /* isPure */,
    policyId
  );

  // Policy doesnt exist.
  if (policy.policyId === "0") {
    res.status(404).send();
  } else {
    res.status(200).send(policy);
  }
});

const port = !_.isUndefined(process.env.PORT) ? process.env.PORT : 4000;
app.listen(port, () => console.log(`app listening on ${port}`));
