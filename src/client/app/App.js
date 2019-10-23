import React from "react";

import { Container } from "react-bootstrap";

import Header from "../components/header";
import Footer from "../components/footer";
import Stepper from "../components/stepper";
import EmptyRow from "../components/utils/EmptyRow";

const App = () => (
  <div className="App">
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
