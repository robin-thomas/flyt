import React, { useContext, useState, useEffect } from "react";

import { MDBBtn } from "mdbreact";

import { DataContext } from "../../utils/DataProvider";
import EmptyRow from "../../utils/EmptyRow";

import config from "../../../../config.json";

const StepperFormPayment = ({ setNextDisabled }) => {
  const [policy, setPolicy] = useState(null);

  // Constant values.
  const ethAddress = config.kyber.receiveETHAddress;
  const callback = encodeURIComponent(config.kyber.callback);
  const network = config[config.app].network;

  const ctx = useContext(DataContext);

  useEffect(() => {
    const _policy = JSON.stringify({
      owner: "dummy", // will be set once the tx is confirmed.
      flight: {
        from: ctx.search.from,
        to: ctx.search.to,
        code: ctx.flight.code,
        name: ctx.flight.name,
        departureTime: ctx.flight.departureTime
      }
    });

    setPolicy(encodeURIComponent(_policy));
  }, [ctx.flight, ctx.search]);

  const [eth, setEth] = useState(0);

  return (
    <div>
      <h4>Payment</h4>
      <p style={{ fontSize: "13px" }}>
        * insurance premium is calculated based on the risk
      </p>
      <EmptyRow height="60px" />
      <MDBBtn
        color="mdb-color"
        className="btn-rounded"
        style={{ margin: "0", padding: "0" }}
        disabled={eth === 0}
      >
        <a
          href={`https://widget.kyber.network/v0.7.2/?type=pay&mode=popup&lang=en&receiveAddr=${ethAddress}&receiveToken=ETH&receiveAmount=${eth}&callback=${callback}&paramForwarding=true&network=${network}&policy=${policy}&theme=theme-dark`}
          className="kyber-widget-button theme-dark theme-supported"
          title="Pay with tokens"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            backgroundColor: "#59698d",
            color: "white",
            fontSize: "0.81rem",
            fontWeight: "400"
          }}
        >
          Pay
        </a>
      </MDBBtn>
    </div>
  );
};

export default StepperFormPayment;
