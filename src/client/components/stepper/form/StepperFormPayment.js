import React, { useContext, useState, useEffect } from "react";

import LZUTF8 from "lzutf8";
import { MDBBtn } from "mdbreact";

import Api from "../../utils/Api";
import { DataContext } from "../../utils/DataProvider";
import EmptyRow from "../../utils/EmptyRow";

import config from "../../../../config.json";

const StepperFormPayment = ({ setIndex, setNextDisabled }) => {
  // Constant values.
  const ethAddress = config.kyber.receiveETHAddress;
  const callback = encodeURIComponent(config.kyber.callback);
  const network = config[config.app].network.name;

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

    ctx.setPolicy(_policy);
  }, [ctx.policyProducts, ctx.setPolicy, ctx.flight, ctx.search]);

  // TODO: to be set after premium is calculated.
  const [eth] = useState(0.001);

  const paymentCheck = async () => {
    let _policy = JSON.stringify(ctx.policy);
    _policy = LZUTF8.compress(_policy, { outputEncoding: "Base64" });
    _policy = encodeURIComponent(_policy);

    const url = config.kyber.pay
      .replace("{ethAddress}", ethAddress)
      .replace("{callback}", callback)
      .replace("{network}", network)
      .replace("{eth}", eth)
      .replace("{policy}", _policy);

    const kyberClass = ["kyber-widget-button", "theme-dark", "theme-supported"];

    const ele = document.createElement("a");
    ele.href = url;
    ele.classList.add(...kyberClass);

    document.body.appendChild(ele);

    window.kyberWidgetOptions.register();

    ele.click();

    document.body.removeChild(ele);

    // Once payment is completed, webook is triggered,
    // which creates a dummy owner policy,
    // existance of which verifies payment is done
    // (payment could fail though).

    while (true) {
      try {
        const _policy = await Api.getPolicy(ctx.policy.policyId);
        if (_policy && _policy.policyId === ctx.policy.policyId) {
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
        style={{ margin: "0" }}
        disabled={eth === 0}
        onClick={paymentCheck}
      >
        Pay
      </MDBBtn>
    </div>
  );
};

export default StepperFormPayment;
