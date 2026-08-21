import { Button } from "react-bootstrap";

const VARIANTS = {
  primary: "btn-vf btn-modern",
  outline: "btn-outline-vf btn-modern",
  danger: "btn-danger-vf btn-modern",
  ghost: "btn-ghost btn-modern",
  soft: "btn-soft btn-modern",
};

export default function VfButton({
  variant = "primary",
  icon,
  children,
  className = "",
  ...props
}) {
  const classes = [VARIANTS[variant] || VARIANTS.primary, className]
    .filter(Boolean)
    .join(" ");

  return (
    <Button className={classes} {...props}>
      {icon && <i className={`bi ${icon} ${children ? "me-2" : ""}`} />}
      {children}
    </Button>
  );
}
