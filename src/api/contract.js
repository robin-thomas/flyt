const Web3 = require("web3");
const HDWalletProvider = require("@truffle/hdwallet-provider");

const keys = require("../keys.json");
const config = require("../config.json");
const contract = require("../truffle/_build/contracts/Flyt.json");

const Contract = {
  sleep: ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  getWeb3Provider: () => {
    return new HDWalletProvider(
      keys.metamask.mnemonic,
      keys.infura.ropsten.api
    );
  },

  getWeb3: (provider = null) => {
    if (provider === null) {
      provider = Contract.getWeb3Provider();
    }

    return new Web3(provider);
  },

  getContract: provider => {
    const web3 = Contract.getWeb3(provider);

    return new web3.eth.Contract(
      contract.abi,
      contract.networks[config.app.network.network_id].address
    );
  },

  invokeFn: async (fnName, isPure, ...args) => {
    const _provider = Contract.getWeb3Provider();
    const _web3 = Contract.getWeb3(_provider);
    const _contract = Contract.getContract(_provider);

    try {
      const _fn = _contract.methods[fnName](...args);
      if (isPure) {
        const accounts = await _web3.eth.getAccounts();

        // Need to set "from" because we are using "msg.sender" in the contract.
        return await _fn.call({
          from: accounts[0]
        });
      } else {
        return await Contract.sendSignedTx(_web3, _fn);
      }
    } catch (err) {
      throw err;
    }
  },

  sendSignedTx: async (web3, fn) => {
    try {
      const accounts = await web3.eth.getAccounts();

      const tx = {
        from: accounts[0],
        to: contract.networks[config.app.network.network_id].address,
        data: fn.encodeABI(),
        gas: 8000000,
        gasPrice: web3.utils.toHex(web3.utils.toWei("20", "Gwei"))
      };

      const signedTx = await web3.eth.signTransaction(tx, tx.from);
      return await web3.eth.sendSignedTransaction(signedTx.raw);
    } catch (err) {
      throw err;
    }
  },

  getTx: async txHash => {
    const _provider = await Contract.getWeb3Provider();
    const _web3 = Contract.getWeb3(_provider);

    // Wait till the transaction is mined.
    let receipt = null;
    while (true) {
      receipt = await _web3.eth.getTransactionReceipt(txHash);
      if (receipt !== null) {
        break;
      }

      await Contract.sleep(1000 /* 1s */);
    }

    try {
      if (receipt.status === true) {
        // Return tx details.
        return await _web3.eth.getTransaction(txHash);
      }

      throw new Error(`Transaction ${txHash} has failed`);
    } catch (err) {
      throw err;
    }
  }
};

module.exports = Contract;
