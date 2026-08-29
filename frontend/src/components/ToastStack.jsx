import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (message, variant = "success") => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((current) => [...current, { id, message, variant }]);
      window.setTimeout(() => dismiss(id), 3600);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`toast-item toast-item-${item.variant}`}
            role="status"
          >
            <i
              className={`bi ${
                item.variant === "danger"
                  ? "bi-exclamation-octagon-fill"
                  : item.variant === "warning"
                    ? "bi-exclamation-triangle-fill"
                    : "bi-check-circle-fill"
              }`}
            />
            <span>{item.message}</span>
            <button
              type="button"
              className="toast-close"
              onClick={() => dismiss(item.id)}
              aria-label="Fermer"
            >
              <i className="bi bi-x" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
