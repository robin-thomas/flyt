import fetch from "node-fetch";

import config from "../../../config.json";

const Api = {
  sleep: ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  getPolicy: async policyId => {
    const url = config[config.app].api.getPolicy.path.replace(
      "{policyId}",
      policyId
    );

    try {
      const res = await fetch(url);
      if (res.status >= 200 && res.status < 300) {
        return await res.json();
      }

      throw new Error(`Policy: ${policyId} not found`);
    } catch (err) {
      throw err;
    }
  }
};

export default Api;
