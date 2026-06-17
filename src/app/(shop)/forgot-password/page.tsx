"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthCard } from "@/components/shop/AuthCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { authErrorMessage } from "@/lib/authErrors";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      toast(authErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Reset password" subtitle="We'll email you a reset link">
      {sent ? (
        <div className="space-y-4">
          <p className="rounded-xl bg-leaf-50 p-4 text-sm text-leaf-700">
            If an account exists for <strong>{email}</strong>, a password reset link is on its way.
          </p>
          <Link href="/login">
            <Button variant="outline" fullWidth>Back to login</Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          <Button type="submit" fullWidth size="lg" loading={loading}>Send reset link</Button>
          <p className="text-center text-sm text-muted">
            <Link href="/login" className="font-medium text-terracotta-600 hover:underline">Back to login</Link>
          </p>
        </form>
      )}
    </AuthCard>
  );
}
