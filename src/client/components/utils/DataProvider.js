import React, { useState } from "react";

import Airports from "../../airports.json";

const DataContext = React.createContext();

const DataProvider = props => {
  const [disabled, setDisabled] = useState(false);
  const [airports] = useState(Airports);
  const [openAbout, setOpenAbout] = useState(false);

  const [valid, setValid] = useState({
    from: false,
    to: false,
    date: false
  });

  const [search, setSearch] = useState({
    from: null,
    to: null,
    date: null
  });

  const [flight, setFlight] = useState({
    code: null,
    name: null,
    departureTime: null
  });

  const [policyId, setPolicyId] = useState(null);
  const [policyProducts, setPolicyProducts] = useState([]);

  return (
    <DataContext.Provider
      value={{
        disabled,
        setDisabled,
        airports,
        search,
        setSearch,
        flight,
        setFlight,
        valid,
        setValid,
        openAbout,
        setOpenAbout,
        policyId,
        setPolicyId,
        policyProducts,
        setPolicyProducts
      }}
    >
      {props.children}
    </DataContext.Provider>
  );
};

const DataConsumer = DataContext.Consumer;

export { DataConsumer };
export { DataContext };
export default DataProvider;
