# Flyt
![](https://img.shields.io/badge/nodejs-12.04-blue.svg)
![](https://img.shields.io/badge/solidity-0.5.8-red)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://opensource.org/licenses/MIT)

# Table of Contents
1. [Introduction](#introduction)
2. [Features](#features)
3. [Architecture](#architecture)
    - [Frontend](#frontend)
    - [Backend](#backend)
    - [Blockchain](#blockchain)
4. [Tests](#tests)
    - [API Tests](#api-tests)
    - [Smart Contract Tests](#smart-contract-tests)

# Introduction
**Flyt** is a Flight Insurance dapp running on Ropsten ethereum testnet.

We have no concept of insurance claims thanks to our blockchain technology. Every eligible policies will be paid out within 24 hours of your flight arrival time. Never do you have to worry about flight insurance again!

# Features
* No accounts or personal details required
* Search for flights based on departure & arrival airport and date
* Fully customizable policy. Can add or remove policy products for which you want to be insured against
* Pay the insurance premium in ETH or a multitude of other cryptocurrencies, thanks to Kyber's technology
* Download the insurance policy document in PDF form
* Search for a policy if you know the policy ID
* Policy shall be paid automatically in ETH to the same wallet from which the premium was paid, once it matures and the user is eligible for a payout.
* Nothing for the user to do other than buying a policy!

# Architecture

### Frontend
The front-end code is written using React, CSS and HTML.

The UI is designed in the form of a stepper form. Once the user selects the departure and arrival airport and departure date, a selection of flights satisfying those criterias will be displayed, from which one should be selected. The user also has the option to add items for which he/she needs to be insured for.

Next is the payment page. The premium the user needs to pay is based on the amount of risk for that policy. The risk is calculated from:
- 70% weightage = past performance of that flight (any cancellations, flight delayed for 15, 30, 45 minutes and so on).
- 30% weightage = departure airport delays (any cancellations, flights delayed for 15, 30, 45 minutes and so on)
If the risk is high, the premium to be paid will also be higher.

The premium calculation is done thanks to Chainlink and smart contracts (which is explained in the blockchain section).

### Backend
Backend is an express server for handling API requests and for payment callbacks (from Kyber).

All flight related APIs are routed through our backend, as the API key & secrets are not stored in this github repo (but rather in our server). Likewise, the private keys of our ethereum account.

The server also uses a key-value cache to speed up some calculations and performance improvements.

**You can view the swagger docs for the APIs used here**: https://flyt.robinthomas2591.now.sh/swagger

##### Calculating the Policy maturity payment:
The policy maturity payment is calculated based on the delay, cancellation of the flight and the insurance products againt which the user has insured for.

**Max possible payment is set to the cancellation rate (which is 1 ETH).**

Once the total delay (including the departure and arrival) is calculated, then the total payment is calculated by the following stub:
- first 15 minutes delay are paid at a rate of 0.001 ETH per minute
- next 30 minutes are paid at a rate of 0.002 ETH per minute
- next 60 minutes are paid at a rate of 0.003 ETH per minute
- next 120 minutes are paid at a rate of 0.004 ETH per minute

### Blockchain
Our smart contract (Flyt.sol) is deployed to Ropsten ethereum testnet.

When a request comes in to calculate the premium for a policy, it'll create 2 Chainlink requests to be sent to the Oracle - once to calculate the aiport rating and the other to calculate the flight rating. When any of the jobs are completed, it'll **update the state of the Premium object for that policy**. Then (thanks to safemath operations), we use **weighted average** method to calculate the premium risk.

This is then passed to the backend server.

# Tests
Tests are categorised into:
- API tests
- Smart contract tests

### API Tests
API tests are run by spawning a local instance of the *express* server that will then connect to the Ropsten ethereum test network before running the tests. These tests are written using *mocha* and *chai*. Test coverage is from *nyc*.

Since the private key of the ethereum wallet is not shared in this github repo, only pure/view contract functions can be executed by these API functional tests. As such, all other contract functions are not covered by these tests.

```sh
npm run dapp:api:test
npm run dapp:api:coverage
```

### Smart Contract Tests
Smart Contract tests are written using *mocha* and are executed with the help of *truffle*. Test coverage is from *solidity-coverage*.

These tests cover both pure/view and stateful smart contract functions and have almost full coverage of the Flyt contract (barring the section of code that is used to set Chainlink public network details).

These tests are run in a test *ganache* network, which mocks the Chainlink network (by creating a LINK token, an ORACLE contract and using those with the Flyt contract). The LINK token is used for making Chainlink requests. Fulfillment function of the oracle is mocked based on the chainlink request to be made.

```sh
npm run contract:test
npm run contract:coverage
```
