import React from "react";

import { Row, Col } from "react-bootstrap";
import { MDBBtn } from "mdbreact";

const StepperBtn = ({ disabled, onClick, text, index }) => {
  return index !== 3 ? (
    <MDBBtn
      color="mdb-color"
      className="btn-rounded"
      style={{ margin: "0" }}
      disabled={index === 0}
      onClick={onClick}
    >
      {text}
    </MDBBtn>
  ) : null;
};

const StepperPagination = ({ index, setIndex, nextDisabled }) => (
  <Row>
    <Col md="auto">
      <StepperBtn
        text="Previous"
        index={index}
        disabled={index === 0}
        onClick={() => setIndex(index - 1)}
      />
    </Col>
    <Col md="auto" className="ml-auto">
      <StepperBtn
        text="Next"
        index={index}
        disabled={nextDisabled}
        onClick={() => setIndex(index + 1)}
      />
    </Col>
  </Row>
);

export default StepperPagination;
