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
  underline = false,
  disabled = false,
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
    <Form.Group className={underline ? "login-field-inner" : undefined}>
      {label && <Form.Label htmlFor={id}>{label}</Form.Label>}
      <div className={underline ? "login-field-input password-input-group" : undefined}>
        <InputGroup className={underline ? undefined : "password-input-group"}>
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
          disabled={disabled}
          autoComplete={antiAutofill ? "off" : autoComplete}
          spellCheck={false}
          autoCapitalize="none"
          autoCorrect="off"
          {...(dataLpignore || antiAutofill ? { "data-lpignore": "true" } : {})}
          {...(data1pIgnore || antiAutofill ? { "data-1p-ignore": true } : {})}
          {...(antiAutofill ? { "data-bwignore": "true", "data-form-type": "other" } : {})}
        />
        <button
          type="button"
          className="password-toggle-btn"
          onClick={() => setShowPassword((visible) => !visible)}
          disabled={disabled}
          aria-label={
            showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"
          }
          aria-pressed={showPassword}
          title={showPassword ? "Masquer" : "Afficher"}
        >
          <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} />
        </button>
      </InputGroup>
      {underline && <span className="login-field-line" aria-hidden="true" />}
      </div>
      {hint && <Form.Text className="text-muted">{hint}</Form.Text>}
    </Form.Group>
  );
}
