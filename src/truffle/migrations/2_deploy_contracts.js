/* global artifacts, web3 */

const Flyt = artifacts.require("Flyt");

module.exports = (deployer, network) => {
  // Local (development) networks need their own deployment of the LINK
  // token and the Oracle contract
  if (network === "test" || network === "soliditycoverage") {
    // Being lazy, do nothing...
  } else {
    // For live networks, use the 0 address to allow the ChainlinkRegistry
    // contract automatically retrieve the correct address for you
    const addr = "0x0000000000000000000000000000000000000000";

    // This is a random jobId and will never be used.
    // For the latest JobIDs, visit our docs here:
    // https://docs.chain.link/docs/testnet-oracles
    const jobId = web3.utils.toHex("4c7b7ffb66b344fbaa64995af81e355a");

    deployer.deploy(Flyt, addr, addr, jobId);
  }
};
