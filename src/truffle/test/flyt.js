/* global artifacts, contract, assert, web3 */

const Flyt = artifacts.require("Flyt");

contract("Flyt", accounts => {
  let flyt;

  const policy = {
    policyId: "123456",
    owner: accounts[0],
    products: ["Hello"],
    flight: {
      from: "from",
      to: "to",
      fsCode: "fsCode",
      carrierCode: "carrierCode",
      name: "name",
      departureTime: "departureTime",
      arrivalTime: "arrivalTime"
    },
    premium: {
      paid: false,
      amount: 0,
      txHash: "txHash"
    },
    payment: {
      paid: false,
      amount: 0,
      txHash: "txHash"
    }
  };

  const from = {
    from: accounts[0]
  };

  beforeEach(async () => {
    flyt = await Flyt.new(accounts[0], from);
  });

  it("getPolicy() should return dummy policy for invalid policyId", async () => {
    const _policy = await flyt.getPolicy.call("0", from);
    assert.equal(_policy.policyId, "0");
  });

  it("getPolicy() should return valid policy for valid policyId", async () => {
    const _data = await flyt.contract.methods
      .createNewPolicy(policy)
      .encodeABI();
    await flyt.sendTransaction({
      to: flyt.address,
      from: accounts[0],
      data: _data
    });

    const _policy = await flyt.getPolicy.call(policy.policyId, from);
    assert.equal(_policy.policyId, policy.policyId);
  });

  it("getPremium() should return 0 for invalid policyId", async () => {
    const _premium = await flyt.getPremium.call("0", from);
    assert.equal(_premium, 0);
  });

  it("getPay() should transfer amount for valid payment request", async () => {
    let _policy = {...policy};
    _policy.policyId = "1111111111";
    _policy.premium.paid = true;

    const _data = await flyt.contract.methods
      .createNewPolicy(_policy)
      .encodeABI();
    await flyt.sendTransaction({
      to: flyt.address,
      from: accounts[0],
      data: _data
    });

    // Fund the contract with 1 ETH.
    flyt.sendTransaction({
      from: await web3.eth.getCoinbase(),
      value: web3.utils.toWei("1", "ether")
    });

    await flyt.payPolicy(_policy.policyId, web3.utils.toWei("0.001", "ether"));

    const policyResult = await flyt.getPolicy.call(_policy.policyId, from);
    assert.equal(policyResult.payment.paid, true);
  });

  it("getPay() should NOT transfer amount for invalid payment request", async () => {
    let _policy = {...policy};
    _policy.policyId = "1111111111";
    _policy.premium.paid = false;

    const _data = await flyt.contract.methods
      .createNewPolicy(_policy)
      .encodeABI();
    await flyt.sendTransaction({
      to: flyt.address,
      from: accounts[0],
      data: _data
    });

    // Fund the contract with 1 ETH.
    flyt.sendTransaction({
      from: await web3.eth.getCoinbase(),
      value: web3.utils.toWei("1", "ether")
    });

    // Supposed to fail at require() statements in the contract.
    try {
      await flyt.payPolicy(
        _policy.policyId,
        web3.utils.toWei("0.001", "ether")
      );
    } catch (err) {}

    const policyResult = await flyt.getPolicy.call(_policy.policyId, from);
    assert.equal(policyResult.payment.paid, false);
  });
});
