import React, { useContext } from "react";

import { MDBIcon, MDBBtn } from "mdbreact";
import { Row, Col, Spinner } from "react-bootstrap";

import { DataContext } from "../../utils/DataProvider";
import EmptyRow from "../../utils/EmptyRow";

const StepperFormComplete = ({ setIndex, setNextDisabled }) => {
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

    ctx.setPolicyId(null);
    ctx.setPolicyProducts([]);

    setIndex(0);
  };

  return (
    <div>
      <EmptyRow height="60px" />
      <Row>
        <Col className="text-center">
          {ctx.policyId === null ? (
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
