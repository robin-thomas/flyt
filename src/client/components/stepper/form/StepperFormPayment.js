import React, {useContext, useState, useEffect, useRef} from "react";

import {MDBIcon} from "mdbreact";
import {Spinner, OverlayTrigger, Popover, Button} from "react-bootstrap";

import Flyt from "../../utils/Flights";
import Kyber from "../../utils/Kyber";
import {DataContext} from "../../utils/DataProvider";
import EmptyRow from "../../utils/EmptyRow";

import Airports from "../../../airports.json";

const StepperFormPayment = ({setIndex, setNextDisabled}) => {
  const ctx = useContext(DataContext);
  const ref = useRef(null);

  // to be set after premium is calculated.
  const [eth, setEth] = useState(0);

  useEffect(() => {
    const calcPolicy = async () => {
      const policyId =
        new Date().valueOf().toString() +
        Math.random()
          .toString(10)
          .substring(2, 10);
      console.log("Policy ID: ", policyId);

      const from = Airports[ctx.search.from].iata;
      const fsCode = ctx.flight.code.split(" ")[0];
      const carrierCode = ctx.flight.code.split(" ")[1];
      const premium = await Flyt.getPremium(
        policyId,
        from,
        fsCode,
        carrierCode
      );

      setEth(premium);

      const _policy = {
        policyId: policyId,
        owner: "0x0000000000000000000000000000000000000000", // will be set once the tx is confirmed
        products: ctx.policyProducts,
        premium: {
          amount: premium
        },
        flight: {
          from: from,
          to: Airports[ctx.search.to].iata,
          fsCode: fsCode,
          carrierCode: carrierCode,
          name: ctx.flight.name,
          departureTime: ctx.flight.departureTime,
          arrivalTime: ctx.flight.arrivalTime
        }
      };

      ctx.setPolicy(_policy);
    };

    calcPolicy();
  }, [ctx.policyProducts, ctx.setPolicy, ctx.flight, ctx.search]);

  return (
    <div>
      <h4>Payment</h4>
      <p style={{fontSize: "13px"}}>
        * insurance premium is calculated based on the risk
      </p>
      {eth === 0 ? (
        <div>
          <p style={{fontSize: "13px"}}>* Calculating insurance premium</p>
          <Spinner animation="border" role="status" />
        </div>
      ) : (
        <div ref={ref}>
          <p style={{fontSize: "15px"}}>
            Insurance premium to be paid: <b>{eth} ETH</b>&nbsp;
            <OverlayTrigger
              trigger="click"
              placement="right"
              container={ref.current}
              rootClose={true}
              overlay={
                <Popover id="popover-positioned-right">
                  <Popover.Title as="h3">
                    How do we calculate the insurance premium?
                  </Popover.Title>
                  <Popover.Content>
                    <Button
                      variant="success"
                      onClick={() => ctx.setOpenAbout(true)}
                    >
                      Click me to see
                    </Button>
                  </Popover.Content>
                </Popover>
              }
            >
              <MDBIcon far icon="question-circle" style={{cursor: "pointer"}} />
            </OverlayTrigger>
          </p>
        </div>
      )}
      <EmptyRow height="50px" />
      <Kyber
        eth={eth}
        disabled={eth === 0}
        cls="btn-rounded"
        cb={() => setIndex(index => index + 1)}
      />
    </div>
  );
};

export default StepperFormPayment;
