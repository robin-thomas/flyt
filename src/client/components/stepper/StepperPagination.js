import React, { useState, useContext } from "react";

import { Row, Col, Spinner } from "react-bootstrap";
import { MDBBtn } from "mdbreact";

import Api from "../utils/Api";
import { DataContext } from "../utils/DataProvider";

const StepperPagination = ({ index, setIndex, nextDisabled }) => {
  const [disabled, setDisabled] = useState(false);

  const ctx = useContext(DataContext);

  const onNext = async index => {
    // Flight has been decided.
    // Create new policy or update it.
    if (index === 2) {
      setDisabled(true);

      await Api.createNewPolicy(ctx.search, ctx.flight);

      setDisabled(false);
    }

    setIndex(index);
  };

  return (
    <Row>
      <Col md="auto">
        <MDBBtn
          color="mdb-color"
          className="btn-rounded"
          disabled={index === 0}
          onClick={() => setIndex(index - 1)}
          style={{ margin: "0" }}
        >
          Previous
        </MDBBtn>
      </Col>
      <Col md="auto" className="ml-auto">
        <MDBBtn
          color="mdb-color"
          className="btn-rounded"
          disabled={nextDisabled || index === 3}
          onClick={() => onNext(index + 1)}
          style={{ margin: "0" }}
        >
          {disabled ? (
            <Spinner animation="border" size="sm" role="status" />
          ) : (
            "Next"
          )}
        </MDBBtn>
      </Col>
    </Row>
  );
};

export default StepperPagination;
