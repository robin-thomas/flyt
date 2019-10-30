# Piper
![](https://img.shields.io/badge/nodejs-12.04-blue.svg)
![](https://img.shields.io/badge/solidity-0.5.8-red)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://opensource.org/licenses/MIT)

# Table of Contents
1. [Introduction](#introduction)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Tests](#tests)

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
* The front-end code is written on React, CSS and HTML
* Express server for handling API requests & payment callbacks
* Ropsten ethereum testnet + Solidity smart contracts

# Tests
Tests are categorised into:
- API tests
- Smart contract tests

##### API Tests
API tests are run by spawning a local instance of the *express* server that will then connect to the Ropsten ethereum test network before running the tests. These tests are written using *mocha* and *chai*. Test coverage is from *nyc*.

Since the private key of the ethereum wallet is not shared in this github repo, only pure/view contract functions can be executed by these API functional tests. As such, all other contract functions are not covered by these tests.

```sh
npm run dapp:api:test
npm run dapp:api:coverage
```

##### Smart Contract Tests
Smart Contract tests are written using *mocha* and are executed with the help of *truffle*. Test coverage is from *solidity-coverage*.

These tests cover both pure/view and stateful smart contract functions and have almost full coverage of the Flyt contract (barring the section of code that is used to set Chainlink public network details).

These tests are run in a test *ganache* network, which mocks the Chainlink network (by creating a LINK token, an ORACLE contract and using those with the Flyt contract). The LINK token is used for making Chainlink requests. Fulfillment function of the oracle is mocked based on the chainlink request to be made.

```sh
npm run contract:test
npm run contract:coverage
```
