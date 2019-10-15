import React, { useState, useContext, createRef, useEffect } from "react";

import { Row, Col } from "react-bootstrap";
import { MDBInput } from "mdbreact";

import { DataContext } from "../utils/DataProvider";

const StepperFormInput = ({ label, state, set, keyName }) => {
  const [autocomplete, setAutocomplete] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const ref = createRef();
  const ctx = useContext(DataContext);

  useEffect(() => {
    const clickHandler = () => setAutocomplete([]);
    document.addEventListener("click", clickHandler);

    if (ctx.valid[keyName]) {
      ref.current.inputElementRef.current.classList.add("is-valid");
    }

    return () => {
      document.removeEventListener("click", clickHandler);
    }
  }, []);

  const closeAutocomplete = (name, airports = []) => {
    setAutocomplete(airports);
    setActiveIndex(0);
    set(name, false /* isValid */);
  };

  const onChange = (name, target) => {
    if (name === null || name === undefined || name.trim().length === 0) {
      closeAutocomplete(name);
    } else {
      const _airports = Object.keys(ctx.airports).filter(e => {
        target.classList.remove("is-valid");
        target.classList.remove("is-invalid");

        if (e.toLowerCase().startsWith(name.toLowerCase())) {
          return true;
        }

        if (ctx.airports[e].iata.toLowerCase().startsWith(name.toLowerCase())) {
          return true;
        }

        return false;
      });
      closeAutocomplete(name, _airports);
    }

    ref.current.inputElementRef.current.classList.remove("is-invalid");
    ref.current.inputElementRef.current.classList.remove("is-valid");
  };

  const onSelect = (name) => {
    closeAutocomplete(name);
    set(name, true /* isValid */);

    ref.current.inputElementRef.current.classList.remove("is-invalid");
    ref.current.inputElementRef.current.classList.add("is-valid");
  };

  const onKeyDown = e => {
    // Esc key.
    if (e.keyCode === 27) {
      closeAutocomplete('');
    }
    // Enter key.
    else if (e.keyCode === 13 && activeIndex >= 0 && activeIndex <= autocomplete.length - 1) {
      onSelect(autocomplete[activeIndex]);
    }
    // Arrow up.
    else if (e.keyCode === 38 && activeIndex > 0) {
      setActiveIndex(activeIndex => activeIndex - 1);
    }
    // Arrow down.
    else if (e.keyCode === 40 && activeIndex < autocomplete.length - 1) {
      setActiveIndex(activeIndex => activeIndex + 1);
    }
  };

  return (
    <Row>
      <Col>
        <MDBInput
          ref={ref}
          label={label}
          value={state ? state : ''}
          onChange={(e) => onChange(e.target.value, e.target)}
          onKeyDown={onKeyDown}
        />
        {autocomplete && autocomplete.length > 0 ? (
          <ul
            className="mdb-autocomplete-wrap"
          >
            {
              autocomplete.map((name, index) => (
                <li
                  key={index}
                  className={`list-item ${activeIndex === index ? 'active' : ''}`}
                  style={{ background: "rgb(255, 255, 255) "}}
                  onClick={() => onSelect(name)}
                >
                  <span>{name}</span>
                  <b>&nbsp;({ctx.airports[name].iata})</b>
                </li>
              ))
            }
          </ul>
        ) : null}
      </Col>
    </Row>
  );
}

export default StepperFormInput;
