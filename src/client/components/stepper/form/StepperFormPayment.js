import React, { useContext, useState, useEffect } from "react";

import { MDBBtn } from "mdbreact";

import Api from "../../utils/Api";
import { DataContext } from "../../utils/DataProvider";
import EmptyRow from "../../utils/EmptyRow";

import config from "../../../../config.json";

const StepperFormPayment = ({ setIndex, setNextDisabled }) => {
  // Constant values.
  const ethAddress = config.kyber.receiveETHAddress;
  const callback = encodeURIComponent(config.kyber.callback);
  const network = config[config.app].network;

  const ctx = useContext(DataContext);

  useEffect(() => {
    const policyId =
      new Date().valueOf().toString() +
      Math.random()
        .toString(10)
        .substring(2, 10);

    const _policy = {
      policyId: policyId,
      owner: "dummy", // will be set once the tx is confirmed.,
      products: ctx.policyProducts,
      flight: {
        from: ctx.search.from,
        to: ctx.search.to,
        code: ctx.flight.code,
        name: ctx.flight.name,
        departureTime: ctx.flight.departureTime
      }
    };

    ctx.setPolicy(encodeURIComponent(JSON.stringify(_policy)));
  }, [ctx.setPolicy, ctx.flight, ctx.search]);

  // TODO: to be set after premium is calculated.
  const [eth] = useState(0.001);

  const paymentCheck = async () => {
    // Once payment is completed, webook is triggered,
    // which creates a dummy owner policy,
    // existance of which verifies payment is done
    // (payment could fail though).

    const decodedPolicy = JSON.parse(decodeURIComponent(ctx.policy));

    while (true) {
      try {
        const _policy = await Api.getPolicy(decodedPolicy.policyId);
        if (_policy && _policy.policyId === decodedPolicy.policyId) {
          break;
        }
      } catch (err) {
        // Policy doesnt exist.
      }

      await Api.sleep(1000 /* 1s */);
    }

    // Policy exists at this point.
    setIndex(index => index + 1);
  };

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
          href={`https://widget.kyber.network/v0.7.2/?type=pay&mode=popup&lang=en&receiveAddr=${ethAddress}&receiveToken=ETH&receiveAmount=${eth}&callback=${callback}&paramForwarding=true&network=${network}&policy=${ctx.policy}&theme=theme-dark`}
          className="kyber-widget-button theme-dark theme-supported"
          title="Pay with tokens"
          target="_blank"
          rel="noopener noreferrer"
          onClick={paymentCheck}
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
