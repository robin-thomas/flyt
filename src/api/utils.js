const Utils = {
  mapPolicyToObject: policy => {
    return {
      policyId: policy[0],
      owner: policy[1],
      txHash: policy[2],
      products: policy[3],
      flight: {
        from: policy[4][0],
        to: policy[4][1],
        code: policy[4][2],
        name: policy[4][3],
        departureTime: policy[4][4]
      }
    };
  }
};

module.exports = Utils;
