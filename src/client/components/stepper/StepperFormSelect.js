import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: "100%",
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

const StepperFormSelect = ({ items }) => {
  const classes = useStyles();
  const [value, setValue] = React.useState(items.length > 0 ? items[0].value : null);

  return (
    <form className={classes.root} autoComplete="off">
      <FormControl className={classes.formControl}>
        <InputLabel>Choose your flight</InputLabel>
        <Select
          value={value ? value : ""}
          onChange={(e) => setValue(e.target.value)}
        >
          {
            items.map((item, index) => (
              <MenuItem key={index} value={item.value}>{item.name}</MenuItem>
            ))
          }
        </Select>
      </FormControl>
    </form>
  );
};

export default StepperFormSelect;
