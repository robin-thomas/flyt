import React from "react";

import { Container } from "react-bootstrap";

import PolicyPdf from "../components/PolicyPdf";
import Header from "../components/header";
import Footer from "../components/footer";
import Stepper from "../components/stepper";
import EmptyRow from "../components/utils/EmptyRow";

const policy = {
  policyId: "12345",
  products: [],
  flight: {
    from: "Singapore Airport",
    to: "Cochin Airport",
    departureDate: "2019-10-22T00:00:00.000",
    arrivalDate: "2019-10-22T00:00:00.000",
    name: "MI",
    code: "468",
  },
};

const App = () => (
  <div className="App">
    <PolicyPdf policy={policy}/>
    <Header />
    <div className="stepper-form-container">
      <Container>
        <EmptyRow height="50px" />
        <Stepper />
        <EmptyRow height="165px" />
      </Container>
    </div>
    <Footer />
  </div>
);

export default App;
