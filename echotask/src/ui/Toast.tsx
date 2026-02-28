import React, { useEffect, useState } from "react";

type ToastItem = { id: string; text: string; type?: "info" | "success" | "error"; ttl?: number };

let pushToast: ((t: Omit<ToastItem, "id">) => void) | null = null;

export function toast(text: string, opts?: { type?: "info" | "success" | "error"; ttl?: number }) {
  pushToast?.({ text, type: opts?.type, ttl: opts?.ttl });
}

export function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([]);
  useEffect(() => {
    pushToast = (t) => {
      const id = Math.random().toString(36).slice(2, 9);
      const item: ToastItem = { id, text: t.text, type: t.type ?? "info", ttl: t.ttl ?? 2400 };
      setItems((arr) => [...arr, item]);
      setTimeout(() => setItems((arr) => arr.filter((x) => x.id !== id)), item.ttl);
    };
    return () => { pushToast = null; };
  }, []);
  return (
    <div style={{
      position: "fixed", left: 0, right: 0, bottom: 20, display: "flex",
      justifyContent: "center", pointerEvents: "none", zIndex: 9999
    }}>
      <div style={{ display: "grid", gap: 8, width: "min(92vw, 420px)" }}>
        {items.map(it => (
          <div key={it.id}
            style={{
              pointerEvents: "auto",
              padding: "10px 12px",
              borderRadius: 10,
              boxShadow: "var(--shadow-lg)",
              background: it.type === "success" ? "var(--color-success)"
                        : it.type === "error" ? "var(--color-error)"
                        : "var(--color-bg-tertiary)",
              color: "white",
              fontSize: 14, lineHeight: 1.2
            }}>
            {it.text}
          </div>
        ))}
      </div>
    </div>
  );
}
