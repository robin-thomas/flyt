import React, { useContext, useEffect } from "react";

import StepperFormInput from "../StepperFormInput";
import DatePicker from "../../utils/DatePicker";

import { DataContext } from "../../utils/DataProvider";

const StepperFormTravel = ({ setNextDisabled }) => {
  const ctx = useContext(DataContext);

  useEffect(() => {
    if (ctx.valid.from && ctx.valid.to && ctx.valid.date) {
      setNextDisabled(false);
    } else {
      setNextDisabled(true);
    }
  }, [ctx.valid, setNextDisabled]);

  const set = (key, value, isValid) => {
    switch (key) {
      default:
      case "from":
        ctx.setSearch(search => { return {...search, from: value}; });
        ctx.setValid(valid => { return {...valid, from: isValid}; });
        break;

      case "to":
        ctx.setSearch(search => { return {...search, to: value}; });
        ctx.setValid(valid => { return {...valid, to: isValid}; });
        break;

      case "date":
        ctx.setSearch(search => { return {...search, date: value}; });
        ctx.setValid(valid => { return {...valid, date: isValid}; });
        break;
    }
  };

  return (
    <div>
      <h4>Fill in your travel details</h4>
      <StepperFormInput
        keyName="from"
        label="From"
        state={ctx.search.from ? ctx.search.from : ""}
        set={(value, isValid) => set("from", value, isValid)}
      />
      <StepperFormInput
        keyName="to"
        label="To"
        state={ctx.search.to ? ctx.search.to : ""}
        set={(value, isValid) => set("to", value, isValid)}
      />
      <DatePicker
        keyName="date"
        label="Travel Date"
        date={ctx.search.date}
        setDate={(value) => set("date", value, true)}
      />
    </div>
  );
};

export default StepperFormTravel;
