import React, { useContext } from "react";

import getComponent from "../components/utils/Component";
import { DataContext } from "../components/utils/DataProvider";

function App() {
  const ctx = useContext(DataContext);

  return <div className="App">{getComponent(ctx.page)}</div>;
}

export default App;
