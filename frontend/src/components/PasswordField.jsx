import { useState } from "react";
import { Form, InputGroup } from "react-bootstrap";

export default function PasswordField({
  value,
  onChange,
  placeholder = "••••••••",
  autoComplete = "current-password",
  required = false,
  id = "password",
  name,
  label = "Mot de passe",
  hint,
  dataLpignore = false,
  data1pIgnore = false,
  antiAutofill = false,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleFocus = (event) => {
    if (antiAutofill && !focused) {
      setFocused(true);
      event.target.removeAttribute("readonly");
    }
  };

  const useMaskedText = antiAutofill && !showPassword;
  const inputType = antiAutofill || showPassword ? "text" : "password";

  return (
    <Form.Group>
      {label && <Form.Label htmlFor={id}>{label}</Form.Label>}
      <InputGroup className="password-input-group">
        <Form.Control
          id={id}
          name={name}
          type={inputType}
          className={useMaskedText ? "password-masked" : undefined}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          required={required}
          readOnly={antiAutofill && !focused}
          autoComplete={antiAutofill ? "off" : autoComplete}
          spellCheck={false}
          {...(dataLpignore || antiAutofill ? { "data-lpignore": "true" } : {})}
          {...(data1pIgnore || antiAutofill ? { "data-1p-ignore": true } : {})}
          {...(antiAutofill ? { "data-bwignore": "true", "data-form-type": "other" } : {})}
        />
        <button
          type="button"
          className="password-toggle-btn"
          onClick={() => setShowPassword((visible) => !visible)}
          aria-label={
            showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"
          }
          title={showPassword ? "Masquer" : "Afficher"}
        >
          <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} />
        </button>
      </InputGroup>
      {hint && <Form.Text className="text-muted">{hint}</Form.Text>}
    </Form.Group>
  );
}
