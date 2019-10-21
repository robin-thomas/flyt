pragma solidity >=0.5.0 <0.6.0;
pragma experimental ABIEncoderV2;

contract Flyt {
  struct Flight {
    string from;
    string to;
    string code;
    string name;
    string departureTime;
  }

  struct Policy {
    bool paid;
    string policyId;
    string owner;
    string txHash;
    string[] products;
    Flight flight;
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
      Policy memory _policy = Policy(false, '0', '', '', products, Flight('', '', '', '', ''));
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

}
