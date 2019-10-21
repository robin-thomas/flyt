const Utils = {
  mapPolicyToObject: policy => {
    return {
      paid: policy[0],
      policyId: policy[1],
      owner: policy[2],
      txHash: policy[3],
      products: policy[4],
      flight: {
        from: policy[5][0],
        to: policy[5][1],
        code: policy[5][2],
        name: policy[5][3],
        departureTime: policy[5][4]
      }
    };
  }
};

module.exports = Utils;
