import React, { useEffect, useState, useContext } from "react";

import _ from "lodash";
import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import { Spinner } from "react-bootstrap";

import StepperChoosePolicy from "../StepperChoosePolicy";
import StepperFormSelect from "../StepperFormSelect";

import { DataContext } from "../../utils/DataProvider";
import Flights from "../../utils/Flights";
import EmptyRow from "../../utils/EmptyRow";

const StepperFormTravel = ({ setNextDisabled }) => {
  const ctx = useContext(DataContext);

  const [flights, setFlights] = useState([]);

  useEffect(() => {
    const fn = async () => {
      // At this point we have the AITA codes of both airports & date.
      if (ctx.search.from) {
        const from = ctx.airports[ctx.search.from].iata;
        const to = ctx.airports[ctx.search.to].iata;
        const date = format(ctx.search.date, "yyyy-MM-dd");

        const results = await Flights.getFlightsByRoute(from, to, date);

        let flights = [];
        for (const result of results) {
          if (
            !_.isUndefined(result.code) &&
            !_.isUndefined(result.name) &&
            !_.isUndefined(result.departureTime)
          ) {
            const departureTime = parseISO(result.departureTime);

            flights[result.code] = {
              code: result.code,
              name: result.name,
              departureTime: result.departureTime,
              arrivalTime: result.arrivalTime,
              displayName: `${result.name} (${result.code}) Dep: ${format(
                departureTime,
                "hh:mm aaa"
              )}`
            };
          }
        }

        setFlights(flights);
      }
    };

    fn();
  }, [ctx.search, ctx.airports]);

  useEffect(() => {
    if (
      ctx.flight.code &&
      ctx.flight.name &&
      ctx.flight.departureTime &&
      ctx.policyProducts.length > 0
    ) {
      setNextDisabled(false);
    } else {
      setNextDisabled(true);
    }
  }, [ctx.flight, ctx.policyProducts, setNextDisabled]);

  return (
    <div>
      <h4>Select your flight</h4>
      {!flights || Object.keys(flights).length === 0 ? (
        <div style={{ fontSize: "13px" }}>
          * loading flights based on your search criteria &nbsp;&nbsp;
          <Spinner animation="border" size="sm" role="status" />
        </div>
      ) : null}
      <StepperFormSelect flights={flights} />
      <EmptyRow height="60px" />
      <h4>Customize your policy</h4>
      <p style={{ fontSize: "13px" }}>* insure against one or more below</p>
      <StepperChoosePolicy />
    </div>
  );
};

export default StepperFormTravel;
