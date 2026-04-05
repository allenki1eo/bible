"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { CheckCircle, WarningCircle, X, Info } from "@phosphor-icons/react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContextType {
  toasts: Toast[];
  toast: (message: string, type?: "success" | "error" | "info") => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 3500);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, toast, removeToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-[72px] right-3 z-[200] flex flex-col gap-2 pointer-events-none max-w-[calc(100vw-24px)]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto animate-toast-in bg-card border shadow-lg rounded-lg px-4 py-3 flex items-center gap-3 min-w-[280px] max-w-sm"
          >
            {t.type === "success" && <CheckCircle size={18} className="text-green-500 shrink-0" weight="fill" />}
            {t.type === "error" && <WarningCircle size={18} className="text-destructive shrink-0" weight="fill" />}
            {t.type === "info" && <Info size={18} className="text-primary shrink-0" weight="fill" />}
            <p className="text-sm flex-1">{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              className="text-muted-foreground hover:text-foreground shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
