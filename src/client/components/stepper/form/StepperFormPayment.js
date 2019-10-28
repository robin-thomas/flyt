import React, {useContext, useState, useEffect} from "react";

import {Spinner} from "react-bootstrap";

import Flyt from "../../utils/Flights";
import Kyber from "../../utils/Kyber";
import {DataContext} from "../../utils/DataProvider";
import EmptyRow from "../../utils/EmptyRow";

import Airports from "../../../airports.json";

const StepperFormPayment = ({setIndex, setNextDisabled}) => {
  const ctx = useContext(DataContext);

  // to be set after premium is calculated.
  const [eth, setEth] = useState(0);

  useEffect(() => {
    const calcPolicy = async () => {
      const policyId =
        new Date().valueOf().toString() +
        Math.random()
          .toString(10)
          .substring(2, 10);

      const from = Airports[ctx.search.from].iata;
      const fsCode = ctx.flight.code.split(" ")[0];
      const carrierCode = ctx.flight.code.split(" ")[1];
      const premium = await Flyt.getPremium(
        policyId,
        from,
        fsCode,
        carrierCode
      );

      setEth(premium);

      const _policy = {
        policyId: policyId,
        owner: "0x0000000000000000000000000000000000000000", // will be set once the tx is confirmed
        products: ctx.policyProducts,
        premium: {
          amount: premium
        },
        flight: {
          from: from,
          to: Airports[ctx.search.to].iata,
          fsCode: fsCode,
          carrierCode: carrierCode,
          name: ctx.flight.name,
          departureTime: ctx.flight.departureTime,
          arrivalTime: ctx.flight.arrivalTime
        }
      };

      ctx.setPolicy(_policy);
    };

    calcPolicy();
  }, [ctx.policyProducts, ctx.setPolicy, ctx.flight, ctx.search]);

  return (
    <div>
      <h4>Payment</h4>
      <p style={{fontSize: "13px"}}>
        * insurance premium is calculated based on the risk
      </p>
      {eth === 0 ? (
        <div>
          <p style={{fontSize: "13px"}}>* Calculating insurance premium</p>
          <Spinner animation="border" role="status" />
        </div>
      ) : null}
      <EmptyRow height="60px" />
      <Kyber
        eth={eth}
        disabled={eth === 0}
        cls="btn-rounded"
        cb={() => setIndex(index => index + 1)}
      />
    </div>
  );
};

export default StepperFormPayment;
