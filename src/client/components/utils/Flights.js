import fetch from "node-fetch";

import * as config from "../../../config.json";

const Flights = {
  getFlightsByRoute: async (from, to, date) => {
    const url = `${config.app.api.getFlightsByRoute.path}?from=${from}&to=${to}&date=${date}`;

    return await (await fetch(url)).json();
  }
};

export default Flights;
