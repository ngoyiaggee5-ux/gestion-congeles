import { useCallback, useState } from "react";
import { Button, Modal } from "react-bootstrap";

/**
 * Dialogue de confirmation élégant (Oui / Non).
 * Usage :
 *   const { askConfirm, ConfirmDialog } = useConfirmDialog();
 *   askConfirm({ message: "...", onConfirm: async () => { ... } });
 *   return (<>...</> <ConfirmDialog />);
 */
export function useConfirmDialog() {
  const [state, setState] = useState(null);

  const close = useCallback(() => {
    setState(null);
  }, []);

  const askConfirm = useCallback(
    ({
      title = "Confirmer",
      message,
      detail = "",
      confirmLabel = "Oui",
      cancelLabel = "Non",
      variant = "danger",
      onConfirm,
    }) => {
      setState({
        title,
        message,
        detail,
        confirmLabel,
        cancelLabel,
        variant,
        onConfirm,
        loading: false,
      });
    },
    []
  );

  const handleConfirm = async () => {
    if (!state?.onConfirm) {
      close();
      return;
    }
    setState((current) => (current ? { ...current, loading: true } : current));
    try {
      await state.onConfirm();
    } finally {
      close();
    }
  };

  const ConfirmDialog = () =>
    state ? (
      <Modal
        show
        onHide={() => !state.loading && close()}
        centered
        className="vf-modal confirm-dialog"
      >
        <Modal.Header closeButton={!state.loading}>
          <Modal.Title>{state.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-0">{state.message}</p>
          {state.detail ? (
            <p className="text-muted small mt-2 mb-0">{state.detail}</p>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={close} disabled={state.loading}>
            {state.cancelLabel}
          </Button>
          <Button
            variant={state.variant}
            onClick={handleConfirm}
            disabled={state.loading}
          >
            {state.loading ? "En cours…" : state.confirmLabel}
          </Button>
        </Modal.Footer>
      </Modal>
    ) : null;

  return { askConfirm, ConfirmDialog, closeConfirm: close };
}
