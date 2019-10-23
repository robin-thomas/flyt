import React, { useContext, useState, useEffect } from "react";

import { MDBIcon, MDBBtn } from "mdbreact";
import { Row, Col, Spinner } from "react-bootstrap";

import Api from "../../utils/Api";
import { DataContext } from "../../utils/DataProvider";
import EmptyRow from "../../utils/EmptyRow";

const StepperFormComplete = ({ setIndex, setNextDisabled }) => {
  const [success, setSuccess] = useState(false);

  const ctx = useContext(DataContext);

  const reset = () => {
    ctx.setValid({
      from: false,
      to: false,
      date: false
    });

    ctx.setSearch({
      from: null,
      to: null,
      date: null
    });

    ctx.setFlight({
      code: null,
      name: null,
      departureTime: null
    });

    ctx.setPolicy(null);
    ctx.setPolicyProducts([]);

    setIndex(0);
  };

  useEffect(() => {
    const paymentCheck = async () => {
      // Once payment is completed, webook is triggered,
      // which creates a dummy owner policy,
      // existance of which verifies payment is done
      // (payment could fail though).

      while (true) {
        try {
          const _policy = await Api.getPolicy(ctx.policy.policyId);
          if (
            _policy &&
            _policy.owner !== "0x0000000000000000000000000000000000000000"
          ) {
            break;
          }
        } catch (err) {
          // Policy doesnt exist.
        }

        await Api.sleep(1000 /* 1s */);
      }

      setSuccess(true);
    };

    paymentCheck();
  });

  return (
    <div>
      <EmptyRow height="60px" />
      <Row>
        <Col className="text-center">
          {success === false ? (
            <div>
              <h4>Waiting for payment confirmation</h4>
              <p style={{ fontSize: "13px" }}>* do not close the browser</p>
              <Spinner animation="border" role="status" />
            </div>
          ) : (
            <div>
              <h4>Payment has been confirmed</h4>
              <MDBIcon icon="check" className="stepper-icon" />
              <EmptyRow height="60px" />
              <MDBBtn
                color="mdb-color"
                className="btn-rounded"
                style={{ margin: "0" }}
                onClick={reset}
                title="Create another policy?"
              >
                Another?
              </MDBBtn>
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default StepperFormComplete;
