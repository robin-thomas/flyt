import fetch from "node-fetch";
import parse from "date-fns/parse";
import format from "date-fns/format";

import * as config from "../../../config.json";
import * as keys from "../../../keys.json";

import Airlines from "../../airlines.json";

const Flights = {
  getFlightsByRoute: async (fromIata, toIata, date) => {
    const parsedDate = parse(date, 'yyyy-MM-dd', new Date());

    const url = config.flightstats.api.getFlightsByRoute
                  .replace('{from}', fromIata)
                  .replace('{to}', toIata)
                  .replace('{date}', format(parsedDate, "yyyy/MM/dd"))
                  .replace('{appId}', keys.flightstats.appId)
                  .replace('{appKey}', keys.flightstats.appKey);

    const resp = await (await fetch(url)).json();

    if (resp.scheduledFlights !== undefined) {
      let results = [];

      for (const flight of resp.scheduledFlights) {
        results.push({
          name: Airlines[flight.carrierFsCode],
          code: `${flight.carrierFsCode} ${flight.flightNumber}`,
          departureTime: flight.departureTime,
          arrivalTime: flight.arrivalTime,
        });
      }

      return results;
    }

    return [];
  },
};

export default Flights;
