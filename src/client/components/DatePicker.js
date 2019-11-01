import React, {forwardRef} from "react";

import DatePicker from "react-datepicker";
import {MDBInput} from "mdbreact";

import format from "date-fns/format";
import addDays from "date-fns/addDays";

import "react-datepicker/dist/react-datepicker.min.css";

import "./DatePicker.css";

const Calendar = forwardRef(({label, date, setDate, onClick}, ref) => (
  <MDBInput
    ref={ref}
    label={label}
    value={date ? format(date, "EEE MMM d, yyyy") : ""}
    onFocus={onClick}
  />
));

const ScheduleDate = ({date, setDate, label}) => (
  <DatePicker
    selected={date}
    onChange={setDate}
    withPortal
    minDate={new Date()}
    maxDate={addDays(new Date(), 7)}
    onClickOutside={() => document.activeElement.blur()}
    customInput={<Calendar date={date} setDate={setDate} label={label} />}
  />
);

export default ScheduleDate;
