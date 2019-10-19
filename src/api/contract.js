const Web3 = require("web3");
const HDWalletProvider = require("truffle-hdwallet-provider");

const keys = require("../../keys.json");
const config = require("../../config.json");
const contract = require("../../_build/contracts/Flyt.json");

const Contract = {
  sleep: ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  getWeb3Provider: () => {
    return new HDWalletProvider(keys.metamask.mnemonic, keys.infura.ropsten);
  },

  getContract: async provider => {
    const web3 = new Web3(provider);
    return new web3.eth.Contract(
      contract.abi,
      contract.networks[config[config.app].network.network_id].address
    );
  },

  invokeFn: async (fnName, isPure, ...args) => {
    const _provider = Contract.getWeb3Provider();
    const _web3 = new Web3(_provider);
    const _contract = await Contract.getContract(_provider);

    const _fn = _contract.methods[fnName](...args);
    if (isPure) {
      return await _fn.call();
    } else {
      await Contract.sendSignedTx(_web3, _fn);
    }
  },

  sendSignedTx: async (web3, fn) => {
    const fnABI = fn.encodeABI();

    try {
      const accounts = await web3.currentProvider.enable();

      return await web3.currentProvider.send("eth_sendTransaction", [
        {
          from: accounts[0],
          to: contract.networks[config.network.network_id].address,
          data: fnABI,
          gas: 8000000,
          gasPrice: web3.utils.toHex(web3.utils.toWei("20", "Gwei"))
        }
      ]);
    } catch (err) {
      throw err;
    }
  },

  getTx: async txHash => {
    const _provider = await Contract.getWeb3Provider();
    const _web3 = new Web3(_provider);

    // Wait till the transaction is mined.
    let receipt = null;
    while (true) {
      receipt = await _web3.eth.getTransactionReceipt(txHash);
      if (!receipt) {
        break;
      }

      await Contract.sleep(1000 /* 1s */);
    }

    // Return tx details.
    return await _web3.eth.getTransaction(txHash);
  }
};

module.exports = Contract;
