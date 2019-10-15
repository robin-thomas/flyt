import React from "react";

import { Row, Col } from "react-bootstrap";
import { MDBBtn } from "mdbreact";

const StepperPagination = ({ index, setIndex, nextDisabled }) => (
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
        onClick={() => setIndex(index + 1)}
        style={{ margin: "0" }}
      >
        Next
      </MDBBtn>
    </Col>
  </Row>
);

export default StepperPagination;
