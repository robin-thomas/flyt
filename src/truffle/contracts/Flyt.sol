pragma solidity >=0.5.0 <0.6.0;
pragma experimental ABIEncoderV2;

import "chainlink/v0.5/contracts/ChainlinkClient.sol";
import "chainlink/v0.5/contracts/vendor/Ownable.sol";
import {
    SafeMath as SafeMath_Chainlink
} from "chainlink/v0.5/contracts/vendor/SafeMath.sol";

/**
 * @title Flyt is a contract which requests data from the Chainlink network
 * @dev This contract is designed to work on multiple networks, including
 * local test networks
 */
contract Flyt is ChainlinkClient, Ownable {
    using SafeMath_Chainlink for uint256;

    bytes32 private constant JOB_ID = "3cff0a3524694ff8834bda9cf9c779a1";
    address private constant ORACLE = 0xc99B3D447826532722E41bc36e644ba3479E4365;

    string private constant GET_AIRPORT_DELAY_URL = "https://flyt.robinthomas2591.now.sh/airport/delay";
    string private constant GET_FLIGHT_RATING_URL = "https://flyt.robinthomas2591.now.sh/flight/stats";

    bytes32 jobId;
    uint256 payment;

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

    enum PremiumRequestStatus {INIT, SENT, COMPLETED}

    struct Premium {
        bool init;
        uint256 airportRating;
        uint256 flightRating;
        PremiumRequestStatus hasAirportRating;
        PremiumRequestStatus hasFlightRating;
    }

    mapping(string => bool) isPolicy;
    mapping(string => Policy) policies;
    mapping(string => Premium) premiums;
    mapping(bytes32 => string) requests;

    /**
     * @notice Deploy the contract with a specified address for the LINK
     * and Oracle contract addresses
     * @dev Sets the storage for the specified addresses
     * @param _link The address of the LINK token contract
     * @param _oracle The address of the ORACLE contract
     * @param _jobId jobId where the Chainlink request to be sent.
     */
    constructor(address _link, address _oracle, bytes32 _jobId) public {
        // Set the address for the LINK token for the network.
        if (_link == address(0)) {
            // Useful for deploying to public networks.
            setPublicChainlinkToken();
            setChainlinkOracle(ORACLE);
            jobId = JOB_ID;
            payment = 1 * LINK;
        } else {
            setChainlinkToken(_link);
            setChainlinkOracle(_oracle);
            jobId = _jobId;
            payment = 1;
        }
    }

    // Create a new policy.
    function createNewPolicy(Policy memory _policy) public onlyOwner {
        policies[_policy.policyId] = _policy;
        isPolicy[_policy.policyId] = true;
    }

    // Get policy details.
    function getPolicy(string memory _policyId)
        public
        view
        onlyOwner
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

    function getPremium(string memory _policyId)
        public
        view
        onlyOwner
        returns (uint256 _result)
    {
        // Calculate the premium if chainlink requests have all returned.
        // Its done using weighted average.
        _result = 0;
        if (
            premiums[_policyId].hasAirportRating ==
            PremiumRequestStatus.COMPLETED &&
            premiums[_policyId].hasFlightRating ==
            PremiumRequestStatus.COMPLETED
        ) {
            // Calculate the value based on weighted average.
            // Flight Rating (based on historical performance) is given 70% weightage.
            // Departure Airport Rating is given 30% weightage.
            uint256 a = premiums[_policyId].flightRating.mul(7);
            uint256 f = premiums[_policyId].airportRating.mul(3);
            _result = a.add(f).div(10);
        }
    }

    // Calculate the policy premium.
    function calculatePremium(
        string memory _policyId,
        string memory _from,
        string memory _fsCode,
        string memory _carrierCode
    ) public onlyOwner {
        // Set the initial state.
        if (premiums[_policyId].init == false) {
            premiums[_policyId].hasAirportRating = PremiumRequestStatus.INIT;
            premiums[_policyId].hasFlightRating = PremiumRequestStatus.INIT;
            premiums[_policyId].init = true;
        }

        // Send the chainlink requests to the oracles if not sent.
        if (premiums[_policyId].hasAirportRating == PremiumRequestStatus.INIT) {
            getAirportRating(_policyId, _from);
        }
        if (premiums[_policyId].hasFlightRating == PremiumRequestStatus.INIT) {
            getFlightRating(_policyId, _from, _fsCode, _carrierCode);
        }
    }

    function getAirportRating(string memory _policyId, string memory _airport)
        private
        returns (bytes32 requestId)
    {
        string memory _url = string(
            abi.encodePacked(GET_AIRPORT_DELAY_URL, "?airport=", _airport)
        );
        string memory _path = string(abi.encodePacked(_airport, ".score"));

        requestId = createRequestTo(
            _url,
            _path,
            this.setAirportRating.selector
        );

        requests[requestId] = _policyId;
        premiums[_policyId].hasAirportRating = PremiumRequestStatus.SENT;
    }

    function setAirportRating(bytes32 _requestId, uint256 _score)
        public
        recordChainlinkFulfillment(_requestId)
    {
        premiums[requests[_requestId]].hasAirportRating = PremiumRequestStatus
            .COMPLETED;
        premiums[requests[_requestId]].airportRating = _score;
    }

    function getFlightRating(
        string memory _policyId,
        string memory _from,
        string memory _fsCode,
        string memory _carrierCode
    ) private returns (bytes32 requestId) {
        string memory _url = string(
            abi.encodePacked(
                GET_FLIGHT_RATING_URL,
                "?from=",
                _from,
                "&fsCode=",
                _fsCode,
                "&carrierCode=",
                _carrierCode
            )
        );

        requestId = createRequestTo(
            _url,
            "score",
            this.setFlightRating.selector
        );

        requests[requestId] = _policyId;
        premiums[_policyId].hasFlightRating = PremiumRequestStatus.SENT;
    }

    function setFlightRating(bytes32 _requestId, uint256 _rating)
        public
        recordChainlinkFulfillment(_requestId)
    {
        premiums[requests[_requestId]].hasFlightRating = PremiumRequestStatus
            .COMPLETED;
        premiums[requests[_requestId]].flightRating = _rating;
    }

    /**
     * @notice Creates a request to the specified Oracle contract address
     * @dev This function ignores the stored Oracle contract address and
     * will instead send the request to the address specified
     * @param _url The URL to fetch data from
     * @param _path The dot-delimited path to parse of the response
     * @param _callbackFn The callback function to call once request is processed
     */
    function createRequestTo(
        string memory _url,
        string memory _path,
        bytes4 _callbackFn
    ) private returns (bytes32 requestId) {
        Chainlink.Request memory req = buildChainlinkRequest(
            jobId,
            address(this),
            _callbackFn
        );
        req.add("url", _url);
        req.add("path", _path);
        requestId = sendChainlinkRequest(req, payment);
    }

    function payPolicy(string memory _policyId, uint256 amount)
        public
        onlyOwner
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
