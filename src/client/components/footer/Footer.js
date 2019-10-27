import React, { useState } from "react";

import format from "date-fns/format";
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
import { Badge, Container, Row, Col } from "react-bootstrap";

import PolicyPdf from "../PolicyPdf";

import Kyber from "../utils/Kyber";
import Api from "../utils/Api";

import config from "../../../config.json";

import "./Footer.css";

const Footer = props => {
  const [open, setOpen] = useState(false);
  const [policyId, setPolicyId] = useState("");
  const [policy, setPolicy] = useState({});
  const [disabled, setDisabled] = useState(true);

  const onChange = policyId => {
    setPolicyId(policyId);

    if (
      policyId === null ||
      policyId === undefined ||
      policyId.trim().length === 0
    ) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  };

  const search = async () => {
    setDisabled(true);

    const policy = await Api.getPolicy(policyId);
    if (
      policy &&
      policy.owner !== "0x0000000000000000000000000000000000000000"
    ) {
      setPolicy(policy);
      setOpen(true);
      setPolicyId("");
    } else {
      alert("Policy not found!");
    }

    setDisabled(false);
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
                onChange={e => onChange(e.target.value)}
              />
            </Col>
            <Col md="3" className="align-self-center">
              <MDBBtn
                outline
                color="mdb-color"
                onClick={search}
                disabled={disabled}
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
                    ? `${policy.flight.name} ${policy.flight.fsCode} ${policy.flight.carrierCode}`
                    : ""}
                </td>
              </tr>
              {policy.flight ? (
                <tr>
                  <td>Departure Time:</td>
                  <td>
                    {format(parseISO(policy.flight.departureTime), "PPpp")}
                  </td>
                </tr>
              ) : null}
              {policy.flight ? (
                <tr>
                  <td>Arrival Time:</td>
                  <td>{format(parseISO(policy.flight.arrivalTime), "PPpp")}</td>
                </tr>
              ) : null}
              {policy.premium && policy.premium.paid ? (
                <tr>
                  <td>Payment:</td>
                  <td>
                    {policy.premium.paid === true ? (
                      <Badge variant="success">
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "white" }}
                          href={config.app.network.explorer.replace(
                            "{txHash}",
                            policy.premium ? policy.premium.txHash : ""
                          )}
                        >
                          Success
                        </a>
                      </Badge>
                    ) : (
                      <Badge variant="danger">
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "white" }}
                          href={config.app.network.explorer.replace(
                            "{txHash}",
                            policy.premium.txHash
                          )}
                        >
                          Failed
                        </a>
                      </Badge>
                    )}
                  </td>
                </tr>
              ) : null}
            </MDBTableBody>
          </MDBTable>
          {policy.premium && policy.premium.paid !== true ? (
            <Kyber eth={policy.premium.amount} cb={console.log} />
          ) : policy.premium && policy.premium.paid === true ? (
            <PolicyPdf policy={policy} />
          ) : null}
        </MDBModalBody>
      </MDBModal>
    </Container>
  );
};

export default Footer;
