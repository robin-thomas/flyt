const express = require("express");
// const cors = require("cors");
const _ = require("lodash");

const app = express();
const port = !_.isUndefined(process.env.PORT) ? process.env.PORT : 4000;

// app.use(cors());
app.use(express.json());
// app.options('*', cors());

app.get("/callback", (req, res) => {
  res.status(200).send({
    status: "ok",
    msg: "hello"
  });
});

app.post("/createPolicy", (req, res) => {
  res.status(200).send();
});

app.get("/getPolicy", (req, res) => {
  res.status(200).send();
});

app.listen(port, () => console.log(`app listening on ${port}`));
