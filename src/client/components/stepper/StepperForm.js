import React from "react";

import StepperFormTravel from "./form/StepperFormTravel";
import StepperFormFlight from "./form/StepperFormFlight";
import StepperFormPayment from "./form/StepperFormPayment";

const getForm = (index, props) => {
  switch (index) {
    case 2:
      return <StepperFormPayment {...props}/>

    case 1:
      return <StepperFormFlight {...props}/>

    default:
    case 0:
      return <StepperFormTravel {...props}/>
  }
}

const StepperForm = ({ index, setNextDisabled }) => {
  return getForm(index, { setNextDisabled });
};

export default StepperForm;
