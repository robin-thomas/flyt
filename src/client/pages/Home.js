import React from "react";

import { Container } from "react-bootstrap";

import Header from "../components/header";
import Footer from "../components/footer";
import Stepper from "../components/stepper";
import EmptyRow from "../components/utils/EmptyRow";

const Home = props => (
  <div>
    <Header />
    <div className="stepper-form-container">
      <Container>
        <EmptyRow height="50px" />
        <Stepper />
        <EmptyRow height="200px" />
      </Container>
    </div>
    <Footer />
  </div>
);

export default Home;
