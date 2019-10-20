import React, { useState } from "react";

import { MDBInput, MDBBtn } from "mdbreact";
import { Container, Row, Col } from "react-bootstrap";

import Api from "../utils/Api";

import "./Footer.css";

const Footer = props => {
  const [policyId, setPolicyId] = useState("");

  const search = async () => {
    const policy = await Api.getPolicy(policyId);
    if (policy && policy.policyId === policyId) {
      console.log(policy);
    } else {
      alert("Policy not found!");
    }
  };

  return (
    <Container className="footer-container">
      <Row>
        <Col
          md="3"
          className="align-self-center text-center retrieve-policy-col"
        >
          <h6>Retrieve Policy</h6>
        </Col>
        <Col md="9" className="align-self-center text-right">
          <Row>
            <Col md="9" className="align-self-center">
              <MDBInput
                value={policyId}
                label="Policy ID"
                onChange={e => setPolicyId(e.target.value)}
              />
            </Col>
            <Col md="3" className="align-self-center">
              <MDBBtn
                outline
                color="mdb-color"
                style={{ marginTop: "-10px", marginRight: "0px" }}
                onClick={search}
              >
                Search
              </MDBBtn>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default Footer;
