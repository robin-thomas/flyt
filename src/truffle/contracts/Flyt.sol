pragma solidity >=0.5.0 <0.6.0;
pragma experimental ABIEncoderV2;

import "chainlink/v0.5/contracts/ChainlinkClient.sol";
import {
    SafeMath as SafeMath_Chainlink
} from "chainlink/v0.5/contracts/vendor/SafeMath.sol";

contract Flyt is ChainlinkClient {
    using SafeMath_Chainlink for uint256;

    bytes32 private constant JOB_ID = "3cff0a3524694ff8834bda9cf9c779a1";
    address private constant ORACLE = 0xc99B3D447826532722E41bc36e644ba3479E4365;

    string private constant GET_AIRPORT_DELAY_URL = "https://flyt.robinthomas2591.now.sh/airport/delay";
    string private constant GET_FLIGHT_RATING_URL = "https://flyt.robinthomas2591.now.sh/flight/stats";

    address public owner;

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
        bool hasAirportRating;
        bool hasFlightRating;
        uint256 airportRating;
        uint256 flightRating;
        uint256 premium;
    }

    mapping(string => bool) isPolicy;
    mapping(string => Policy) policies;
    mapping(string => Premium) premiums;
    mapping(bytes32 => string) requests;

    constructor() public {
        setPublicChainlinkToken();
        owner = msg.sender; // set the owner of the contract.
    }

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
    function getPolicy(string memory _policyId)
        public
        view
        _ownerOnly
        returns (Policy memory)
    {
        if (isPolicy[_policyId] == true) {
            // Policy exists.
            Policy memory _policy = policies[_policyId];
            return _policy;
        } else {
            // Policy doesnt exist.
            // Return a dummy.
            string[] memory products;
            Policy memory _policy = Policy(
                "0",
                address(0),
                products,
                Flight("", "", "", "", "", "", ""),
                Payment(false, 0, ""),
                Payment(false, 0, "")
            );
            return _policy;
        }
    }

    // Calculate the policy premium.
    function getPremium(
        string memory _policyId,
        string memory _from,
        string memory _fsCode,
        string memory _carrierCode
    ) public returns (uint256 result) {
        require(isPolicy[_policyId] == true);

        // Send the chainlink requests to the oracles if not sent.
        if (premiums[_policyId].hasAirportRating == false) {
            getAirportRating(_policyId, _from);
        }
        if (premiums[_policyId].hasFlightRating == false) {
            getFlightRating(_policyId, _from, _fsCode, _carrierCode);
        }

        // Calculate the premium if chainlink requests have all returned.
        // Its done using weighted average.
        result = 0;
        if (
            premiums[_policyId].hasAirportRating == true &&
            premiums[_policyId].hasFlightRating == true
        ) {
            // Calculate the value based on weighted average.
            // Flight Rating (based on historical performance) is given 70% weightage.
            // Departure Airport Rating is given 30% weightage.
            uint256 a = premiums[_policyId].flightRating.mul(7);
            uint256 f = premiums[_policyId].airportRating.mul(3);
            result = a.add(f).div(10);
            result = 100.sub(result);

            premiums[_policyId].premium = result;
        }
    }

    function getAirportRating(string memory _policyId, string memory _airport)
        private
        returns (bytes32 requestId)
    {
        Chainlink.Request memory req = buildChainlinkRequest(
            JOB_ID,
            address(this),
            this.setAirportRating.selector
        );

        req.add(
            "get",
            string(
                abi.encodePacked(GET_AIRPORT_DELAY_URL, "?airport=", _airport)
            )
        );

        req.add("path", string(abi.encodePacked(_airport, ".score")));

        requestId = sendChainlinkRequestTo(ORACLE, req, 1 * LINK);

        requests[requestId] = _policyId;
    }

    function setAirportRating(bytes32 _requestId, uint256 _score)
        public
        recordChainlinkFulfillment(_requestId)
    {
        premiums[requests[_requestId]].hasAirportRating = true;
        premiums[requests[_requestId]].airportRating = _score;
    }

    function getFlightRating(
        string memory _policyId,
        string memory _from,
        string memory _fsCode,
        string memory _carrierCode
    ) private returns (bytes32 requestId) {
        Chainlink.Request memory req = buildChainlinkRequest(
            JOB_ID,
            address(this),
            this.setFlightRating.selector
        );
        req.add(
            "get",
            string(
                abi.encodePacked(
                    GET_FLIGHT_RATING_URL,
                    "?from=",
                    _from,
                    "&fsCode=",
                    _fsCode,
                    "&carrierCode",
                    _carrierCode
                )
            )
        );
        req.add("path", string(abi.encodePacked(_from, ".score")));

        requestId = sendChainlinkRequestTo(ORACLE, req, 1 * LINK);

        requests[requestId] = _policyId;
    }

    function setFlightRating(bytes32 _requestId, uint256 _rating)
        public
        recordChainlinkFulfillment(_requestId)
    {
        premiums[requests[_requestId]].hasFlightRating = true;
        premiums[requests[_requestId]].flightRating = _rating;
    }

    function payPolicy(string memory _policyId, uint256 amount)
        public
        _ownerOnly
    {
        require(isPolicy[_policyId] == true);
        require(policies[_policyId].owner != address(0));
        require(policies[_policyId].premium.paid == true);
        require(policies[_policyId].payment.paid == false);

        policies[_policyId].owner.transfer(amount);

        policies[_policyId].payment.paid = true;
        policies[_policyId].payment.amount = amount;
    }

    function() external payable {}

}
