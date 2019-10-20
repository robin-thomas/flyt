import React, { useState } from "react";

import parseISO from "date-fns/parseISO";
import {
  MDBInput,
  MDBBtn,
  MDBModal,
  MDBModalBody,
  MDBCardHeader,
  MDBTable,
  MDBTableBody
} from "mdbreact";
import { Container, Row, Col } from "react-bootstrap";

import Api from "../utils/Api";

import config from "../../../config.json";

import "./Footer.css";

const Footer = props => {
  const [open, setOpen] = useState(false);
  const [policyId, setPolicyId] = useState("");
  const [policy, setPolicy] = useState({});

  const search = async () => {
    const policy = await Api.getPolicy(policyId);
    if (policy && policy.owner !== "dummy") {
      setPolicy(policy);
      setOpen(true);
      setPolicyId("");
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
      <MDBModal isOpen={open} toggle={() => setOpen(open => !open)}>
        <MDBCardHeader color="mdb-color lighten-1">
          Policy #{policy.policyId}
        </MDBCardHeader>
        <MDBModalBody>
          <MDBTable striped>
            <MDBTableBody>
              <tr>
                <td>Policy Products:</td>
                <td>
                  {policy.products && policy.products.length > 0
                    ? policy.products.join(", ")
                    : ""}
                </td>
              </tr>
              <tr>
                <td>Departure Airport:</td>
                <td>{policy.flight ? policy.flight.from : ""}</td>
              </tr>
              <tr>
                <td>Arrival Airport:</td>
                <td>{policy.flight ? policy.flight.to : ""}</td>
              </tr>
              <tr>
                <td>Flight:</td>
                <td>
                  {policy.flight
                    ? `${policy.flight.name} ${policy.flight.code}`
                    : ""}
                </td>
              </tr>
              <tr>
                <td>Departure Time:</td>
                <td>
                  {policy.flight
                    ? parseISO(policy.flight.departureTime).toLocaleString()
                    : ""}
                </td>
              </tr>
              <tr>
                <td>Transaction:</td>
                <td>
                  {policy.txHash ? (
                    <MDBBtn
                      style={{ margin: "0px" }}
                      color="mdb-color"
                      outline
                      size="sm"
                    >
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={config.app.network.explorer.replace(
                          "{txHash}",
                          policy.txHash
                        )}
                      >
                        Explorer
                      </a>
                    </MDBBtn>
                  ) : (
                    ""
                  )}
                </td>
              </tr>
            </MDBTableBody>
          </MDBTable>
        </MDBModalBody>
      </MDBModal>
    </Container>
  );
};

export default Footer;
