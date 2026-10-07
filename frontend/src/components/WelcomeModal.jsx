import { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useApp } from "../data/AppContext";
import { ROLE_LABELS } from "../utils/permissions";

export default function WelcomeModal() {
  const { currentUser } = useApp();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!currentUser?.id) return;
    const pending = sessionStorage.getItem("mbala-pending-welcome");
    if (pending && Number(pending) === currentUser.id) {
      sessionStorage.removeItem("mbala-pending-welcome");
      setShow(true);
    }
  }, [currentUser?.id]);

  if (!currentUser) return null;

  const firstName =
    currentUser.name?.trim().split(/\s+/)[0] || currentUser.email?.split("@")[0] || "collègue";
  const roleLabel = ROLE_LABELS[currentUser.role] || currentUser.role;

  return (
    <Modal
      show={show}
      onHide={() => setShow(false)}
      centered
      className="vf-modal welcome-modal"
      backdropClassName="welcome-modal-backdrop"
    >
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="d-flex align-items-center gap-2">
          <span className="welcome-modal-icon" aria-hidden="true">
            <i className="bi bi-hand-index-thumb" />
          </span>
          Bienvenue
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="welcome-modal-greeting mb-2">
          Bonjour <strong>{firstName}</strong>,
        </p>
        <p className="welcome-modal-text mb-3">
          Vous êtes connecté à <strong>MBALA KWA SELEMANI</strong> en tant que{" "}
          <span className="welcome-modal-role">{roleLabel}</span>.
        </p>
        <p className="welcome-modal-hint mb-0">
          Bonne session de travail — ventes, stock et rapports sont à portée de main.
        </p>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0">
        <Button variant="success" className="welcome-modal-btn" onClick={() => setShow(false)}>
          C&apos;est parti
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
