const _ = require("lodash");
const express = require("express");

const Contract = require("./contract");
const config = require("../../config.json");

const app = express();
app.use(express.json());
app.use(express.urlencoded());

app.post(config.flyt.api.callback, async (req, res) => {
  const policyId = Number(req.body.policyId);
  const txHash = req.body.tx;

  await Contract.invokeFn("updateTxHash", policyId, txHash);

  res.status(200).send();
});

app.post(config.flyt.api.createNewPolicy, async (req, res) => {
  const policy = req.body.policy;

  await Contract.invokeFn("createNewPolicy", policy);

  res.status(200).send();
});

const port = !_.isUndefined(process.env.PORT) ? process.env.PORT : 4000;
app.listen(port, () => console.log(`app listening on ${port}`));
