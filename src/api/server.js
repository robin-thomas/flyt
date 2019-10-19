const _ = require("lodash");
const express = require("express");

const Contract = require("./contract");
const config = require("../../config.json");

const app = express();
app.use(express.json());
app.use(express.urlencoded());

app.post(config[config.app].api.callback.path, async (req, res) => {
  let policy = JSON.parse(decodeURIComponent(req.body.policy));
  policy.txHash = req.body.tx;

  const tx = await Contract.getTx(policy.txHash);
  policy.owner = tx.from;

  await Contract.invokeFn("createNewPolicy", false /* isPure */, policy);

  res.status(200).send();
});

app.get(config[config.app].api.policy.path, async (req, res) => {
  const policyId = req.query.policyId;

  const policy = await Contract.invokeFn(
    "getPolicy",
    true /* isPure */,
    policyId
  );

  res.status(200).send(policy);
});

const port = !_.isUndefined(process.env.PORT) ? process.env.PORT : 4000;
app.listen(port, () => console.log(`app listening on ${port}`));
