import React, {useContext} from "react";

import {MDBIcon, MDBModal, MDBModalBody, MDBModalHeader} from "mdbreact";
import {Accordion, Card, Container, Row, Col, Button} from "react-bootstrap";

import {DataContext} from "../utils/DataProvider";

import config from "../../../config.json";

import "./Header.css";

const Header = props => {
  const ctx = useContext(DataContext);

  return (
    <Row className="header">
      <Col>
        <Container style={{height: "100%"}}>
          <Row style={{height: "100%"}}>
            <Col md="auto" className="align-self-center title">
              <MDBIcon icon="helicopter" />
              &nbsp; {config.app.name}
            </Col>
            <Col md="auto" className="ml-auto align-self-center title">
              <span
                style={{cursor: "pointer"}}
                onClick={() => ctx.setOpenAbout(true)}
              >
                About
              </span>
            </Col>
          </Row>
        </Container>
      </Col>
      <MDBModal
        isOpen={ctx.openAbout}
        toggle={() => ctx.setOpenAbout(open => !open)}
      >
        <MDBModalHeader toggle={() => ctx.setOpenAbout(open => !open)}>
          About
        </MDBModalHeader>
        <MDBModalBody>
          <Accordion defaultActiveKey="0">
            <Card>
              <Card.Header>
                <Accordion.Toggle as={Button} variant="link" eventKey="0">
                  <b>How can our customers claim their insurance payouts?</b>
                </Accordion.Toggle>
              </Card.Header>
              <Accordion.Collapse eventKey="0">
                <Card.Body>
                  <p style={{textAlign: "justify"}}>
                    We have no concept of <b>insurance claims</b> thanks to our
                    blockchain technology. Every eligible policies will be paid
                    out within 24 hours of your flight arrival time. Never do
                    you have to worry about flight insurance again!
                  </p>
                </Card.Body>
              </Accordion.Collapse>
            </Card>
            <Card>
              <Card.Header>
                <Accordion.Toggle as={Button} variant="link" eventKey="1">
                  <b>
                    How do we monitor how and when to make an insurance payout?
                  </b>
                </Accordion.Toggle>
              </Card.Header>
              <Accordion.Collapse eventKey="1">
                <Card.Body>
                  <p style={{textAlign: "justify"}}>
                    All you have to do is to buy a policy. Our technology will
                    be continuously monitoring the flight details and calculate
                    the payout accordingly. Nothing for you to do other than
                    buying a policy!
                  </p>
                </Card.Body>
              </Accordion.Collapse>
            </Card>
            <Card>
              <Card.Header>
                <Accordion.Toggle as={Button} variant="link" eventKey="2">
                  <b>How do we calculate the insurance premium to be paid?</b>
                </Accordion.Toggle>
              </Card.Header>
              <Accordion.Collapse eventKey="2">
                <Card.Body>
                  <p style={{textAlign: "justify"}}>
                    The insurance premium is calculated as the weighted average
                    of flight rating and the airport rating. Flight rating is
                    given 70% weightage, whereas the airport rating is given 30%
                    weightage.
                  </p>
                  <p style={{textAlign: "justify"}}>
                    Flight rating takes into accord its previous history of
                    cancellations, number of delays in 15 minutes, 30 minutes,
                    45 minutes and so on. Airport rating takes into accord
                    ratings of all the flights that departs from that airport.
                  </p>
                </Card.Body>
              </Accordion.Collapse>
            </Card>
            <Card>
              <Card.Header>
                <Accordion.Toggle as={Button} variant="link" eventKey="3">
                  <b>Can customers customize their policies?</b>
                </Accordion.Toggle>
              </Card.Header>
              <Accordion.Collapse eventKey="3">
                <Card.Body>
                  <p style={{textAlign: "justify"}}>
                    All our policies are <b>fully customizable policies</b>. You
                    can add or remove items to your policy to create a policy
                    that best suits you.
                  </p>
                </Card.Body>
              </Accordion.Collapse>
            </Card>
            <Card>
              <Card.Header>
                <Accordion.Toggle as={Button} variant="link" eventKey="4">
                  <b>Do we value our customers' privacy?</b>
                </Accordion.Toggle>
              </Card.Header>
              <Accordion.Collapse eventKey="4">
                <Card.Body>
                  <p style={{textAlign: "justify"}}>
                    Ofcourse we do! We do not need any of your personal details
                    ever! All our policies are stored in the blockchain, so it
                    can viewed by anyone.
                  </p>
                </Card.Body>
              </Accordion.Collapse>
            </Card>
          </Accordion>
        </MDBModalBody>
      </MDBModal>
    </Row>
  );
};

export default Header;
