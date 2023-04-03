import { useCallback, useEffect, useState } from "react";
import "./App.css";
import logo from "./logo.svg";
import PinInput, { PinInputProps } from "./pin-input";

function App() {
  const [config, setConfig] = useState<PinInputProps>({});
  const [regex, setRegex] = useState<string>("[a-z]");

  useEffect(() => {
    setConfig({
      isSecret: false,
      length: 10,
      onCompleted: (pin) => {
        console.log(`onCompleted`, pin);
        setConfig((pre) => ({
          ...pre,
          disabled: true,
        }));
      },
      onChange: (pin) => console.log(`onChange`, pin),
      boxValidate: (value) => {
        return new RegExp("[a-z]").test(value);
      },
      disabled: false,
    });
  }, []);

  const changeProps = (field: keyof PinInputProps, value: any) => {
    if (field === "boxValidate") {
      setRegex(value);
      setConfig((pre) => ({
        ...pre,
        [field]: (x) => {
          return new RegExp(value).test(x);
        },
      }));

      return;
    }
    setConfig((pre) => ({
      ...pre,
      [field]: value,
    }));
  };
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <PinInput {...config} />
        <div
          style={{
            display: "flex",
            marginTop: "2rem",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <button onClick={() => changeProps("disabled", !config.disabled)}>
            Switch input state
          </button>
          <button onClick={() => changeProps("isSecret", !config.isSecret)}>
            Switch input mode
          </button>
          <div style={{ display: "flex" }}>
            <span style={{ fontSize: "1rem", marginRight: "1rem" }}>
              Pin length:{" "}
            </span>
            <input
              type="number"
              style={{ width: "3rem", display: "block" }}
              value={config.length}
              onChange={(e) => changeProps("length", +e.target.value || 5)}
            />
          </div>
          <div style={{ display: "flex" }}>
            <span style={{ fontSize: "1rem", marginRight: "1rem" }}>
              Box validate:{" "}
            </span>
            <input
              type="text"
              style={{ width: "3rem", display: "block" }}
              value={regex}
              onChange={(e) => changeProps("boxValidate", e.target.value)}
            />
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
