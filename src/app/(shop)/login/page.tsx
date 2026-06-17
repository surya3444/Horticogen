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

function LoginInner() {
  const { login } = useAuth();
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/account";
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast("Welcome back!", "success");
      router.push(next);
    } catch (err) {
      toast(authErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Welcome back" subtitle="Log in to your HorticoGen account">
      <form onSubmit={submit} className="space-y-4">
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm text-terracotta-600 hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" fullWidth size="lg" loading={loading}>Log in</Button>
      </form>
      <p className="mt-5 text-center text-sm text-muted">
        New to HorticoGen?{" "}
        <Link href={`/register?next=${encodeURIComponent(next)}`} className="font-medium text-terracotta-600 hover:underline">
          Create an account
        </Link>
      </p>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
