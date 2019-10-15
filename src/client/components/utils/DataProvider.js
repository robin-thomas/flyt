import React, { useState } from "react";

import Airports from "../../airports.json";

const DataContext = React.createContext();

const DataProvider = props => {
  const [disabled, setDisabled] = useState(false);
  const [page, setPage] = useState("home");
  const [airports] = useState(Airports);
  const [openAbout, setOpenAbout] = useState(false);

  const [valid, setValid] = useState({
    from: false,
    to: false,
    date: false,
  });

  const [search, setSearch] = useState({
    from: null,
    to: null,
    date: null,
  });

  return (
    <DataContext.Provider
      value={{
        disabled,
        setDisabled,
        page,
        setPage,
        airports,
        search,
        setSearch,
        valid, setValid,
        openAbout, setOpenAbout,
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
