const Contract = require("./contract");

const Utils = {
  sleep: ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  mapPolicyToObject: policy => {
    return {
      policyId: policy[0],
      owner: policy[1],
      products: policy[2],
      flight: {
        from: policy[3][0],
        to: policy[3][1],
        fsCode: policy[3][2],
        carrierCode: policy[3][3],
        name: policy[3][4],
        departureTime: policy[3][5],
        arrivalTime: policy[3][6]
      },
      premium: {
        paid: policy[4][0],
        amount: parseFloat(Contract.getWeb3().utils.fromWei(policy[4][1])),
        txHash: policy[4][2]
      },
      payment: {
        paid: policy[5][0],
        amount: parseFloat(Contract.getWeb3().utils.fromWei(policy[5][1])),
        txHash: policy[5][2]
      }
    };
  }
};

module.exports = Utils;
