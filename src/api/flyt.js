const fetch = require("node-fetch");
const parseISO = require("date-fns/parseISO");
const format = require("date-fns/format");
const isBefore = require("date-fns/isBefore");
const differenceInDays = require("date-fns/differenceInDays");

const Contract = require("./contract");
const Cache = require("./cache");

const config = require("../config.json");
const keys = require("../keys.json");
const airports = require("../client/airports.json");
const airlines = require("../client/airlines.json");

const Flyt = {
  toIata: name => {
    try {
      return airports[name].iata;
    } catch (err) {
      return null;
    }
  },

  calculatePayment: async policyId => {
    try {
      const policy = await Contract.invokeFn(
        "getPolicy",
        true /* isPure */,
        policyId
      );

      // get the flight status.
      const status = await Flyt.getFlightStatus(
        policy.flight.from,
        policy.flight.to,
        policy.flight.code,
        policy.flight.departureTime
      );

      if (status === null || status === undefined) {
        throw new Error("Unable to find flight status!");
      }

      let delay = 0;
      let cancelled = false;
      for (const product of policy.products) {
        switch (product) {
          case "Flight Departure Delay":
            delay += status.departureGateDelayMinutes;
            break;

          case "Flight Arrival Delay":
            delay += status.arrivalGateDelayMinutes;
            break;

          case "Flight Cancellation":
            cancelled = status.cancelled === true;
            break;

          default:
            break;
        }
      }

      if (cancelled === true) {
        return config.app.payment.cancelled;
      }

      // First X minutes get paid at rate Ra.
      // Next Y minutes get paid at rate Rb.
      // Next Z minutes get paid at rate Rc, and so on.
      let slabs = Object.keys(config.app.payment.delay)
        .map(e => Number(e))
        .sort();

      let payment = 0;
      let slabIndex = 0;

      while (delay > 0) {
        if (delay > slabs[slabIndex]) {
          payment +=
            slabs[slabIndex] * config.app.payment.delay[slabs[slabIndex]];
          delay -= slabs[slabIndex];
          slabIndex++;
        } else {
          payment += delay * config.app.payment.delay[slabs[slabIndex]];
          delay = 0;
        }

        // Max payment is set to the cancellation rate.
        if (slabIndex > slabs.length) {
          payment = config.app.payment.cancelled;
          break;
        }
      }

      return payment;
    } catch (err) {
      throw err;
    }
  },

  getFlightStatus: async (from, to, code, date) => {
    const parsedDate = parseISO(date);

    const key = `${from}-${to}-${code}-${format(parsedDate, "yyyyMMddH")}`;

    const getFlightStatus = flightStatuses => {
      for (const flightStatus of flightStatuses) {
        if (
          `${flightStatus.carrierFsCode} ${flightStatus.flightNumber}` === code
        ) {
          return {
            cancelled: flightStatus.status === "C",
            departureGateDelayMinutes:
              flightStatus.delays.departureGateDelayMinutes,
            arrivalGateDelayMinutes: flightStatus.delays.arrivalGateDelayMinutes
          };
        }
      }
    };

    const value = await Cache.get(key, "flight");
    if (value !== undefined && value !== null) {
      return getFlightStatus(value.flightStatuses);
    }

    // Validations.

    if (
      isBefore(parsedDate, new Date()) &&
      differenceInDays(new Date(), parsedDate) > 6
    ) {
      throw new Error("Date interval should be within 7 days!");
    }

    if (
      isBefore(new Date(), parsedDate) &&
      differenceInDays(parsedDate, new Date()) > 6
    ) {
      throw new Error("Date interval should be within 7 days!");
    }

    const url = config.flightstats.getFlightStatsByRoute
      .replace("{from}", from)
      .replace("{to}", to)
      .replace("{year}", format(parsedDate, "yyyy"))
      .replace("{month}", format(parsedDate, "MM"))
      .replace("{day}", format(parsedDate, "dd"))
      .replace("{hourOfDay}", format(parsedDate, "H"))
      .replace("{appId}", keys.flightstats.appId)
      .replace("{appKey}", keys.flightstats.appKey);

    const resp = await (await fetch(url)).json();
    await Cache.set(key, resp, "flight");

    return getFlightStatus(resp.flightStatuses);
  },

  pay: async (policyId, payment) => {
    // Convert eth to wei.
    const wei = Contract.getWeb3().utils.toWei(payment, "ether"); // 1000000000000000000 wei

    // Pay the policy owner.
    await Contract.invokeFn("payPolicy", false /* isPure */, policyId, wei);
  },

  getFlightsByRoute: async (fromIata, toIata, date) => {
    const url = config.flightstats.api.getFlightsByRoute
      .replace("{from}", fromIata)
      .replace("{to}", toIata)
      .replace("{date}", format(date, "yyyy/MM/dd"))
      .replace("{appId}", keys.flightstats.appId)
      .replace("{appKey}", keys.flightstats.appKey);

    const resp = await (await fetch(url)).json();

    if (resp.scheduledFlights !== undefined) {
      let results = [];

      for (const flight of resp.scheduledFlights) {
        results.push({
          name: airlines[flight.carrierFsCode],
          code: `${flight.carrierFsCode} ${flight.flightNumber}`,
          departureTime: flight.departureTime,
          arrivalTime: flight.arrivalTime
        });
      }

      return results;
    }

    return [];
  },

  getFlightStats: async (carrier, flightCode, from) => {
    const url = config.flightstats.api.getFlightStats
      .replace("{carrier}", carrier)
      .replace("{flightCode}", flightCode)
      .replace("{from}", from)
      .replace("{appId}", keys.flightstats.appId)
      .replace("{appKey}", keys.flightstats.appKey);

    const resp = await (await fetch(url)).json();

    if (resp.ratings.length === 0) {
      let result = {};
      result[from] = {
        score: 50
      };
    }

    return {
      score: Math.floor(resp.ratings[0].ontimePercent * 100),
      delayed: resp.ratings[0].delayObservations,
      cancelled: resp.ratings[0].cancelled
    };
  },

  getDelayByAirport: async airport => {
    const url = config.flightstats.api.getDelayByAirport
      .replace("{airport}", airport)
      .replace("{appId}", keys.flightstats.appId)
      .replace("{appKey}", keys.flightstats.appKey);

    const resp = await (await fetch(url)).json();

    let results = {};
    if (resp.delayIndexes !== undefined && resp.delayIndexes.length > 0) {
      for (const ele of resp.delayIndexes) {
        const airport = ele.airport;

        results[airport.iata] = {
          score: Math.floor((5.0 - ele.normalizedScore) * 20),
          cancelled: ele.cancelled,
          delayed15: ele.delayed15,
          delayed30: ele.delayed30,
          delayed45: ele.delayed45
        };
      }
    }

    return results;
  }
};

module.exports = Flyt;
