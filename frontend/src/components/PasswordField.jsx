import { useState } from "react";
import { Form, InputGroup } from "react-bootstrap";

export default function PasswordField({
  value,
  onChange,
  placeholder = "••••••••",
  autoComplete = "current-password",
  required = false,
  id = "password",
  label = "Mot de passe",
  hint,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Form.Group>
      {label && <Form.Label htmlFor={id}>{label}</Form.Label>}
      <InputGroup className="password-input-group">
        <Form.Control
          id={id}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
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
