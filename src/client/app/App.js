import React from "react";

import Footer from "../components/footer";
import Header from "../components/header";
import Stepper from "../components/stepper";
import EmptyRow from "../components/utils/EmptyRow";

const App = () => (
  <div className="App">
    <Header />
    <div className="stepper-form-container">
      <EmptyRow height="50px" />
      <Stepper />
      <EmptyRow height="150px" />
      <Footer />
    </div>
  </div>
);

export default App;
