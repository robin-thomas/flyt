/* global artifacts, contract, assert, web3, context */

const BN = require("bn.js");
const h = require("chainlink").helpers;
const l = require("./helpers/linkToken");
const {expectRevert} = require("@openzeppelin/test-helpers");

const Flyt = artifacts.require("Flyt");
const Oracle = artifacts.require("Oracle");

const encodeUint256 = int => {
  let zeros =
    "0000000000000000000000000000000000000000000000000000000000000000";
  let payload = int.toString(16);
  return (zeros + payload).slice(payload.length);
};

contract("Flyt", accounts => {
  const defaultAccount = accounts[0];
  const oracleNode = accounts[1];
  const consumer = accounts[2];

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

  const jobId = web3.utils.toHex("4c7b7ffb66b344fbaa64995af81e355a");

  let link, oc, flyt;
  beforeEach(async () => {
    link = await l.linkContract(defaultAccount);
    oc = await Oracle.new(link.address, {from: defaultAccount});
    flyt = await Flyt.new(link.address, oc.address, jobId, {from: consumer});
    await oc.setFulfillmentPermission(oracleNode, true, {
      from: defaultAccount
    });
  });

  describe("#getPolicy", () => {
    it("getPolicy() should return dummy policy for invalid policyId", async () => {
      const _policy = await flyt.getPolicy.call("0", {from: consumer});
      assert.equal(_policy.policyId, "0");
    });

    it("getPolicy() should return valid policy for valid policyId", async () => {
      const _data = await flyt.contract.methods
        .createNewPolicy(policy)
        .encodeABI();
      await flyt.sendTransaction({
        to: flyt.address,
        from: consumer,
        data: _data
      });

      const _policy = await flyt.getPolicy.call(policy.policyId, {
        from: consumer
      });
      assert.equal(_policy.policyId, policy.policyId);
    });
  });

  describe("#getPremium", () => {
    it("getPremium() should return 0 for invalid policyId", async () => {
      const _premium = await flyt.getPremium.call("0", {from: consumer});
      assert.equal(_premium, 0);
    });
  });

  describe("#calculatePremium", () => {
    context("without LINK", () => {
      it("transaction should fail", async () => {
        await expectRevert.unspecified(
          flyt.calculatePremium(policy.policyId, "SIN", "MI", "468", {
            from: consumer
          })
        );
      });
    });

    context("with LINK", () => {
      beforeEach(async () => {
        await link.transfer(flyt.address, web3.utils.toWei("1", "ether"));
      });

      it("calculatePremium() should be able to send chainlink request to the oracle", async () => {
        const tx = await flyt.calculatePremium(
          policy.policyId,
          "SIN",
          "MI",
          "468",
          {
            from: consumer
          }
        );

        const request = h.decodeRunRequest(tx.receipt.rawLogs[3]);

        assert.equal(oc.address, tx.receipt.rawLogs[3].address);
        assert.equal(
          request.topic,
          web3.utils.keccak256(
            "OracleRequest(bytes32,address,bytes32,uint256,address,bytes4,uint256,uint256,bytes)"
          )
        );
      });
    });
  });

  describe("#calculatePremium fulfill", () => {
    // Calculate the expected premium value.
    // (weighted average method).
    const expected1 = 40,
      expected2 = 70;
    const expected1BN = new BN(expected1, 10).muln(3);
    const expected2BN = new BN(expected2, 10).muln(7);
    const expected = expected1BN.add(expected2BN).divn(10);

    beforeEach(async () => {
      await link.transfer(flyt.address, web3.utils.toWei("1", "ether"));
      const tx = await flyt.calculatePremium(
        policy.policyId,
        "SIN",
        "MI",
        "468",
        {
          from: consumer
        }
      );

      const request1 = h.decodeRunRequest(tx.receipt.rawLogs[3]);
      const request2 = h.decodeRunRequest(tx.receipt.rawLogs[7]);

      await h.fulfillOracleRequest(
        oc,
        request1,
        `0x${encodeUint256(expected1)}`,
        {from: oracleNode}
      );
      await h.fulfillOracleRequest(
        oc,
        request2,
        `0x${encodeUint256(expected2)}`,
        {from: oracleNode}
      );
    });

    it("getPremium() should return correct premium value", async () => {
      const _premium = await flyt.getPremium.call(policy.policyId, {
        from: consumer
      });

      assert.equal(_premium.toNumber(), expected.toNumber());
    });
  });

  describe("#getPay", () => {
    it("getPay() should transfer amount for valid payment request", async () => {
      let _policy = {...policy};
      _policy.policyId = "1111111111";
      _policy.premium.paid = true;

      const _data = await flyt.contract.methods
        .createNewPolicy(_policy)
        .encodeABI();
      await flyt.sendTransaction({
        to: flyt.address,
        from: consumer,
        data: _data
      });

      // Fund the contract with 1 ETH.
      flyt.sendTransaction({
        from: await web3.eth.getCoinbase(),
        value: web3.utils.toWei("1", "ether")
      });

      await flyt.payPolicy(
        _policy.policyId,
        web3.utils.toWei("0.001", "ether"),
        {from: consumer}
      );

      const policyResult = await flyt.getPolicy.call(_policy.policyId, {
        from: consumer
      });
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
        from: consumer,
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

      const policyResult = await flyt.getPolicy.call(_policy.policyId, {
        from: consumer
      });
      assert.equal(policyResult.payment.paid, false);
    });
  });
});
