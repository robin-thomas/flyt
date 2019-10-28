import fetch from "node-fetch";

import * as config from "../../../config.json";

const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const Flights = {
  getFlightsByRoute: async (from, to, date) => {
    const url = `${config.app.api.getFlightsByRoute.path}?from=${from}&to=${to}&date=${date}`;
    return await (await fetch(url)).json();
  },

  getPremium: async (policyId, from, fsCode, carrierCode) => {
    const url = `${config.app.api.getPremium.path}?policyId=${policyId}&from=${from}&fsCode=${fsCode}&carrierCode=${carrierCode}`;

    while (true) {
      const premium = await (await fetch(url)).json();

      if (
        premium.premium === undefined ||
        isNaN(premium.premium) ||
        premium.premium === 0
      ) {
        await sleep(2000);
        continue;
      }

      return premium.premium;
    }
  }
};

export default Flights;
