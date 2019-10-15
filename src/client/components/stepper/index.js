import React, { useState, useContext } from "react";

import { MDBBtn } from "mdbreact";
import { Container, Row, Col } from "react-bootstrap";

import StepperForm from "./StepperForm";
import StepperChooser from "./StepperChooser";
import StepperPagination from "./StepperPagination";

import EmptyRow from "../utils/EmptyRow";
import { DataContext } from "../utils/DataProvider";

import "./index.css";

const Stepper = props => {
  const [index, setIndex] = useState(0);
  const [nextDisabled, setNextDisabled] = useState(true);

  const ctx = useContext(DataContext);

  return (
    <Container>
      <Row>
        <Col xs="12" md="5" className="align-self-center" style={{ color: "white" }}>
          <h1>Flight Insurance</h1>
          <hr style={{ borderColor: "white" }}/>
          <EmptyRow height="25px" />
          <Row>
            <Col md="9">
              <p style={{ background: "rgba(0, 0, 0, 0.03)" }}>
                Fill in your flight details.
                Customize your insurance policy.
                Pay the insurance premium through crypto.
                That's it!
              </p>
            </Col>
          </Row>
          <MDBBtn
            outline
            color="white"
            onClick={() => ctx.setOpenAbout(true)}
          >
            Learn More
          </MDBBtn>
        </Col>
        <Col xs="12" md="7">
          <Row className="stepper-form">
            <Col md="9" className="ml-auto">
              <EmptyRow height="50px"/>
              <Row style={{ height: "400px" }}>
                <Col>
                  <StepperForm index={index} setNextDisabled={setNextDisabled} />
                </Col>
              </Row>
              <Row>
                <Col>
                  <StepperPagination index={index} setIndex={setIndex} nextDisabled={nextDisabled}/>
                </Col>
              </Row>
            </Col>
            <Col md="1">&nbsp;</Col>
            <Col md="auto" className="align-self-left">
              <StepperChooser index={index}/>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default Stepper;
