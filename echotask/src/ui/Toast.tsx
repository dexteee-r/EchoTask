// src/ui/Toast.tsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ToastItem = { id: string; text: string; type?: "info" | "success" | "error"; ttl?: number };

let pushToast: ((t: Omit<ToastItem, "id">) => void) | null = null;

export function toast(text: string, opts?: { type?: "info" | "success" | "error"; ttl?: number }) {
  pushToast?.({ text, type: opts?.type, ttl: opts?.ttl });
}

const colors = {
  success: { bg: 'rgba(52, 211, 153, 0.15)', border: 'rgba(52, 211, 153, 0.3)', dot: '#34d399' },
  error:   { bg: 'rgba(248, 113, 113, 0.15)', border: 'rgba(248, 113, 113, 0.3)', dot: '#f87171' },
  info:    { bg: 'rgba(255, 255, 255, 0.75)',  border: 'rgba(0, 0, 0, 0.06)',      dot: '#a5b4fc' },
};

export function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    pushToast = (t) => {
      const id = Math.random().toString(36).slice(2, 9);
      const item: ToastItem = { id, text: t.text, type: t.type ?? "info", ttl: t.ttl ?? 2600 };
      setItems((arr) => [...arr, item]);
      setTimeout(() => setItems((arr) => arr.filter((x) => x.id !== id)), item.ttl);
    };
    return () => { pushToast = null; };
  }, []);

  return (
    <div style={{
      position: "fixed", left: 0, right: 0, bottom: 32,
      display: "flex", justifyContent: "center",
      pointerEvents: "none", zIndex: 9999,
    }}>
      <div style={{ display: "grid", gap: 8, width: "min(88vw, 380px)" }}>
        <AnimatePresence>
          {items.map(it => {
            const c = colors[it.type || 'info'];
            return (
              <motion.div
                key={it.id}
                initial={{ opacity: 0, y: 12, scale: 0.95, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  pointerEvents: "auto",
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: c.bg,
                  border: `1px solid ${c.border}`,
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 13,
                  fontFamily: 'var(--font-family)',
                  color: 'var(--color-text)',
                  lineHeight: 1.4,
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
                {it.text}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
