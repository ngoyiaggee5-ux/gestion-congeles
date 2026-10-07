import { useEffect, useRef } from "react";
import { api as apiClient, getApiToken } from "../utils/api";
import { isApiMode } from "../utils/config";

const POLL_MS = 4000;

/**
 * Synchronise l'état app entre appareils via polling léger de /sync-version.
 * Préserve le panier local. Pause si onglet caché.
 */
export function useLiveSync({ enabled, onRemoteChange }) {
  const versionRef = useRef(null);
  const syncingRef = useRef(false);
  const onChangeRef = useRef(onRemoteChange);
  onChangeRef.current = onRemoteChange;

  useEffect(() => {
    if (!enabled || !isApiMode) return undefined;

    let cancelled = false;
    let timer = null;

    const poll = async () => {
      if (cancelled || document.visibilityState === "hidden") return;
      if (!getApiToken() || syncingRef.current) return;

      try {
        const { data } = await apiClient.get("/sync-version", { timeout: 4000 });
        const next = String(data?.version ?? "");
        if (!next) return;

        if (versionRef.current == null) {
          versionRef.current = next;
          return;
        }

        if (next !== versionRef.current) {
          versionRef.current = next;
          syncingRef.current = true;
          try {
            await onChangeRef.current?.();
          } finally {
            syncingRef.current = false;
          }
        }
      } catch {
        // silencieux : réseau temporaire
      }
    };

    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        await poll();
        if (!cancelled) schedule();
      }, POLL_MS);
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        poll();
        schedule();
      }
    };

    poll();
    schedule();
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [enabled]);
}
