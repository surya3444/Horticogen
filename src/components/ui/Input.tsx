"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const fieldBase =
  "w-full rounded-xl border border-sand bg-white px-4 py-2.5 text-sm text-ink placeholder:text-muted/70 focus:outline-none focus:border-terracotta-400 focus:ring-2 focus:ring-terracotta-100 transition";

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className, id, ...rest },
  ref
) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <input ref={ref} id={id} className={cn(fieldBase, error && "border-red-400", className)} {...rest} />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
});

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, className, id, ...rest },
  ref
) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <textarea ref={ref} id={id} className={cn(fieldBase, "min-h-[96px] resize-y", error && "border-red-400", className)} {...rest} />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
});

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, className, id, children, ...rest },
  ref
) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <select ref={ref} id={id} className={cn(fieldBase, "appearance-none bg-white", error && "border-red-400", className)} {...rest}>
        {children}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
});
