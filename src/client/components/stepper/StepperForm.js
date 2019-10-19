import React from "react";

import StepperFormTravel from "./form/StepperFormTravel";
import StepperFormFlight from "./form/StepperFormFlight";
import StepperFormPayment from "./form/StepperFormPayment";
import StepperFormComplete from "./form/StepperFormComplete";

const getForm = (index, props) => {
  switch (index) {
    case 0:
      return <StepperFormComplete {...props} />;

    case 2:
      return <StepperFormPayment {...props} />;

    case 1:
      return <StepperFormFlight {...props} />;

    default:
    case 3:
      return <StepperFormTravel {...props} />;
  }
};

const StepperForm = ({ index, setIndex, setNextDisabled }) => {
  return getForm(index, { setIndex, setNextDisabled });
};

export default StepperForm;
