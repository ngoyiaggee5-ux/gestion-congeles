import { useCallback, useState } from "react";
import { Button } from "react-bootstrap";

function compute(a, b, op) {
  switch (op) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "×":
      return a * b;
    case "÷":
      return b === 0 ? 0 : a / b;
    default:
      return b;
  }
}

function formatDisplay(value) {
  if (!Number.isFinite(value)) return "Erreur";
  const str = String(value);
  if (str.includes(".")) {
    const [int, dec] = str.split(".");
    return dec.length > 6 ? value.toFixed(4) : str;
  }
  return str;
}

const KEYS = [
  ["C", "⌫", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "-"],
  ["1", "2", "3", "+"],
  ["0", ".", "="],
];

export default function CashierCalculator({ onApply }) {
  const [display, setDisplay] = useState("0");
  const [stored, setStored] = useState(null);
  const [operator, setOperator] = useState(null);
  const [fresh, setFresh] = useState(true);

  const current = parseFloat(display) || 0;

  const pressClear = useCallback(() => {
    setDisplay("0");
    setStored(null);
    setOperator(null);
    setFresh(true);
  }, []);

  const pressDigit = useCallback(
    (key) => {
      if (key === ".") {
        if (fresh) {
          setDisplay("0.");
          setFresh(false);
          return;
        }
        if (display.includes(".")) return;
        setDisplay(`${display}.`);
        return;
      }

      if (fresh) {
        setDisplay(key);
        setFresh(false);
      } else {
        setDisplay(display === "0" ? key : `${display}${key}`);
      }
    },
    [display, fresh]
  );

  const pressOperator = useCallback(
    (op) => {
      if (operator && !fresh) {
        const result = compute(stored, current, operator);
        setStored(result);
        setDisplay(formatDisplay(result));
      } else {
        setStored(current);
      }
      setOperator(op);
      setFresh(true);
    },
    [operator, fresh, stored, current]
  );

  const pressEquals = useCallback(() => {
    if (operator == null || stored == null) return;
    const result = compute(stored, current, operator);
    setDisplay(formatDisplay(result));
    setStored(null);
    setOperator(null);
    setFresh(true);
  }, [operator, stored, current]);

  const pressBackspace = useCallback(() => {
    if (fresh || display.length <= 1) {
      setDisplay("0");
      setFresh(true);
      return;
    }
    const next = display.slice(0, -1);
    setDisplay(next || "0");
  }, [display, fresh]);

  const pressPercent = useCallback(() => {
    setDisplay(formatDisplay(current / 100));
    setFresh(true);
  }, [current]);

  const handleKey = (key) => {
    if (key === "C") pressClear();
    else if (key === "⌫") pressBackspace();
    else if (key === "=") pressEquals();
    else if (key === "%") pressPercent();
    else if (["+", "-", "×", "÷"].includes(key)) pressOperator(key);
    else pressDigit(key);
  };

  const applyAmount = () => {
    const value = parseFloat(display);
    if (Number.isFinite(value)) onApply?.(value);
  };

  return (
    <div className="cashier-calc">
      <div className="cashier-calc-header">
        <i className="bi bi-calculator me-2" />
        Calculatrice caissier
      </div>
      <div className="cashier-calc-display" aria-live="polite">
        {display}
      </div>
      <div className="cashier-calc-keys">
        {KEYS.map((row, ri) => (
          <div key={ri} className="cashier-calc-row">
            {row.map((key) => (
              <button
                key={key}
                type="button"
                className={`cashier-calc-key${
                  ["+", "-", "×", "÷", "="].includes(key) ? " is-op" : ""
                }${["C", "⌫", "%"].includes(key) ? " is-fn" : ""}${
                  key === "0" ? " is-zero" : ""
                }`}
                onClick={() => handleKey(key)}
              >
                {key}
              </button>
            ))}
          </div>
        ))}
      </div>
      <Button
        type="button"
        className="btn-vf btn-modern w-100 mt-3"
        onClick={applyAmount}
      >
        <i className="bi bi-arrow-down-circle me-2" />
        Appliquer au montant reçu
      </Button>
    </div>
  );
}
