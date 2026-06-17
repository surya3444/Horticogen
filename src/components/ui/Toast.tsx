"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";
interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastCtx {
  toast: (message: string, type?: ToastType) => void;
}

const Ctx = createContext<ToastCtx>({ toast: () => {} });

export function useToast() {
  return useContext(Ctx);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3800);
  }, []);

  const remove = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "flex items-start gap-2 rounded-xl px-4 py-3 shadow-lg text-sm font-medium animate-fade-in min-w-[260px] max-w-[360px]",
              t.type === "success" && "bg-leaf-600 text-white",
              t.type === "error" && "bg-red-600 text-white",
              t.type === "info" && "bg-ink text-white"
            )}
          >
            {t.type === "success" && <CheckCircle2 size={18} className="mt-0.5 shrink-0" />}
            {t.type === "error" && <AlertCircle size={18} className="mt-0.5 shrink-0" />}
            {t.type === "info" && <Info size={18} className="mt-0.5 shrink-0" />}
            <span className="flex-1">{t.message}</span>
            <button onClick={() => remove(t.id)} className="opacity-70 hover:opacity-100">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
