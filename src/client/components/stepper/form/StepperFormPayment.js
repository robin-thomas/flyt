import React from "react";

import { MDBBtn } from "mdbreact";

import EmptyRow from "../../utils/EmptyRow";

import config from "../../../../config.json";

const StepperFormPayment = ({
  setNextDisabled,
  policyId,
  eth = 1,
  ethAddress = config.kyber.receiveETHAddress,
  callback = encodeURIComponent(config.kyber.callback),
  network = config.flyt.network
}) => (
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
    >
      <a
        href={`https://widget.kyber.network/v0.7.2/?type=pay&mode=popup&lang=en&receiveAddr=${ethAddress}&receiveToken=ETH&receiveAmount=${eth}&callback=${callback}&paramForwarding=true&network=${network}&policyId=${policyId}&theme=theme-dark`}
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

export default StepperFormPayment;
