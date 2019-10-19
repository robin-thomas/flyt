import React, { useContext } from "react";

import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

import isBefore from "date-fns/isBefore";
import parseISO from "date-fns/parseISO";

import { DataContext } from "../utils/DataProvider";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexWrap: "wrap"
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: "100%"
  },
  selectEmpty: {
    marginTop: theme.spacing(2)
  }
}));

const StepperFormSelect = ({ flights }) => {
  const classes = useStyles();
  const [value, setValue] = React.useState(
    flights.length > 0 ? flights[0].value : null
  );

  const ctx = useContext(DataContext);

  const onChange = code => {
    setValue(code);
    ctx.setFlight(flights[code]);
  };

  return (
    <form className={classes.root} autoComplete="off">
      <FormControl className={classes.formControl}>
        <InputLabel>Choose your flight</InputLabel>
        <Select
          value={value ? value : ""}
          onChange={e => onChange(e.target.value)}
        >
          {Object.keys(flights)
            .sort((codeA, codeB) => {
              // Sort them based on departure time.
              return isBefore(
                parseISO(flights[codeA].departureTime),
                parseISO(flights[codeB].departureTime)
              )
                ? -1
                : 1;
            })
            .map((code, index) => (
              <MenuItem key={index} value={code}>
                {flights[code].displayName}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </form>
  );
};

export default StepperFormSelect;
