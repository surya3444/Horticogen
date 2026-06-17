"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthCard } from "@/components/shop/AuthCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { authErrorMessage } from "@/lib/authErrors";

function RegisterInner() {
  const { register } = useAuth();
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/account";
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast("Password should be at least 6 characters.", "error");
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
      toast("Account created 🌱", "success");
      router.push(next);
    } catch (err) {
      toast(authErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Create your account" subtitle="Join HorticoGen and start growing">
      <form onSubmit={submit} className="space-y-4">
        <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" placeholder="At least 6 characters" />
        <Button type="submit" fullWidth size="lg" loading={loading}>Create account</Button>
      </form>
      <p className="mt-5 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-medium text-terracotta-600 hover:underline">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterInner />
    </Suspense>
  );
}
