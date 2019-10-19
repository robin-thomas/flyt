import fetch from "node-fetch";

import config from "../../../config.json";

const Api = {
  createNewPolicy: async (search, flight) => {
    const policy = {
      owner: "dummy", // will be set once the tx is confirmed.
      flight: {
        from: search.from,
        to: search.to,
        code: flight.code,
        name: flight.name,
        departureTime: flight.departureTime
      }
    };

    try {
      const res = await fetch(config[config.app].api.createNewPolicy.path, {
        method: config[config.app].api.createNewPolicy.method,
        body: JSON.stringify(policy),
        headers: { "Content-Type": "application/json" }
      });

      return await res.json();
    } catch (err) {
      throw err;
    }
  }
};

export default Api;
