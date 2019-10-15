import React from "react";

import { Row, Col } from "react-bootstrap";
import { MDBBtn, MDBIcon, MDBTooltip } from "mdbreact";

const ChooserBtn = ({ icon, desc, active }) => (
  <div>
    <div className="stepper-chooser-line" />
    <MDBTooltip
      placement="top"
    >
      <MDBBtn
        outline={!active}
        color="mdb-color"
        className="stepper-chooser-icon btn-rounded-icon"
        style={{ cursor: "default" }}
      >
        <MDBIcon icon={icon} className="stepper-icon"/>
      </MDBBtn>
      <div>{desc}</div>
    </MDBTooltip>
    <div className="stepper-chooser-line" />
  </div>
);

const StepperChooser = ({ index }) => {
  const icons = [
    {
      icon: "user",
      desc: "Fill in your travel details",
    },
    {
      icon: "helicopter",
      desc: "Choose your flight and policy",
    },
    {
      icon: "dollar-sign",
      desc: "Make your payment",
    },
    {
      icon: "check",
      desc: "Finish",
    }
  ];

  return (
    <div className="stepper-chooser">
      {
        icons.map((icon, i) => (
          <Row key={i} className="stepper-chooser-row">
            <Col>
              <ChooserBtn {...icon} active={i === index} />
            </Col>
          </Row>
        ))
      }
    </div>
  );
};

export default StepperChooser;
