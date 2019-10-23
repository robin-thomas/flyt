import React, { useContext } from "react";

import LZUTF8 from "lzutf8";
import { MDBBtn } from "mdbreact";

import Api from "./Api";
import { DataContext } from "./DataProvider";

import contract from "../../../truffle/_build/contracts/Flyt.json";
import config from "../../../config.json";

const Kyber = ({ cls, disabled, eth, cb }) => {
  // Constant values.
  const ethAddress = contract.networks[config.app.network.network_id].address;
  const callback = encodeURIComponent(config.kyber.callback);
  const network = config.app.network.name;

  const ctx = useContext(DataContext);

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

    // Once payment is completed, webhook is triggered,
    // which creates a dummy owner policy,
    // existance of which verifies payment is done
    // (payment could fail though).

    console.log(`Policy ID: ${ctx.policy.policyId}`);

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
    cb();
  };

  return (
    <MDBBtn
      color="mdb-color"
      className={cls ? cls : ""}
      style={{ margin: "0" }}
      disabled={disabled ? disabled : false}
      onClick={paymentCheck}
    >
      Pay
    </MDBBtn>
  );
};

export default Kyber;
