import React from "react";

import { Row, Col } from "react-bootstrap";

const EmptyRow = ({ height }) => (
  <Row style={{ height: (height ? height : "15px") }}>
    <Col>&nbsp;</Col>
  </Row>
);

export default EmptyRow;
