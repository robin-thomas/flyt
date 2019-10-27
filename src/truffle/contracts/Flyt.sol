pragma solidity >=0.5.0 <0.6.0;
pragma experimental ABIEncoderV2;

contract Flyt {
  struct Flight {
    string from;
    string to;
    string fsCode;
    string carrierCode;
    string name;
    string departureTime;
    string arrivalTime;
  }

  struct Payment {
    bool paid;
    uint256 amount;
    string txHash;
  }

  struct Policy {
    string policyId;
    address payable owner;
    string[] products;
    Flight flight;
    Payment premium;
    Payment payment;
  }

  struct Premium {
    bool chainlink;
    bool hasWeather;
  }

  mapping(string => bool) isPolicy;
  mapping(string => Policy) policies;
  mapping(string => Premium) premiums;

  address owner = msg.sender; // set the owner of the contract.

  modifier _ownerOnly() {
    require(msg.sender == owner);
    _;
  }

  // Create a new policy.
  function createNewPolicy(Policy memory _policy) public _ownerOnly {
    policies[_policy.policyId] = _policy;
    isPolicy[_policy.policyId] = true;
  }

  // Get policy details.
  function getPolicy(string memory _policyId) public view _ownerOnly returns (Policy memory) {
    if (isPolicy[_policyId] == true) {
      // Policy exists.
      Policy memory _policy = policies[_policyId];
      return _policy;
    } else {
      // Policy doesnt exist.
      // Return a dummy.
      string[] memory products;
      Policy memory _policy = Policy('0', address(0), products, Flight('', '', '', '', '', '', ''), Payment(false, 0, ''), Payment(false, 0, ''));
      return _policy;
    }
  }

  // Calculate the policy premium.
  function getPremium(string memory _policyId) public view returns (Premium memory) {
    require(isPolicy[_policyId] == true);

    Premium memory _premium = premiums[_policyId];

    // Send the chainlink requests to various oracles if not sent.

    return _premium;
  }

  function payPolicy(string memory _policyId, uint256 amount) public _ownerOnly {
    require(isPolicy[_policyId] == true);
    require(policies[_policyId].owner != address(0));
    require(policies[_policyId].premium.paid == true);
    require(policies[_policyId].payment.paid == false);

    policies[_policyId].owner.transfer(amount);

    policies[_policyId].payment.paid = true;
    policies[_policyId].payment.amount = amount;
  }

  // To be able to receive ETH.
  function () external payable {}

}
