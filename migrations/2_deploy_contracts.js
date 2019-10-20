const Flight = artifacts.require("Flight");

module.exports = function(deployer) {
  deployer.deploy(Flight);
};
