import React, { useContext, useState, useEffect } from "react";

import Kyber from "../../utils/Kyber";
import { DataContext } from "../../utils/DataProvider";
import EmptyRow from "../../utils/EmptyRow";

const StepperFormPayment = ({ setIndex, setNextDisabled }) => {
  const ctx = useContext(DataContext);

  useEffect(() => {
    const policyId =
      new Date().valueOf().toString() +
      Math.random()
        .toString(10)
        .substring(2, 10);

    const _policy = {
      policyId: policyId,
      owner: "0x0000000000000000000000000000000000000000", // will be set once the tx is confirmed.,
      products: ctx.policyProducts,
      flight: {
        from: ctx.search.from,
        to: ctx.search.to,
        code: ctx.flight.code,
        name: ctx.flight.name,
        departureTime: ctx.flight.departureTime,
        arrivalTime: ctx.flight.arrivalTime
      }
    };

    ctx.setPolicy(_policy);
  }, [ctx.policyProducts, ctx.setPolicy, ctx.flight, ctx.search]);

  // TODO: to be set after premium is calculated.
  const [eth] = useState(0.01);

  return (
    <div>
      <h4>Payment</h4>
      <p style={{ fontSize: "13px" }}>
        * insurance premium is calculated based on the risk
      </p>
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
