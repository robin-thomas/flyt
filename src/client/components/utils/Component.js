import React from "react";

import Home from "../../pages/Home";

const getComponent = page => {
  switch (page) {
    case "home":
    default:
      return <Home />;
  }
};

export default getComponent;
