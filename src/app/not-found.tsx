import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <span className="text-6xl">🪴</span>
      <h1 className="mt-4 font-display text-3xl font-bold text-ink">Page not found</h1>
      <p className="mt-2 text-muted">The page you&apos;re looking for has wandered off into the garden.</p>
      <Link
        href="/"
        className="mt-6 inline-flex h-11 items-center rounded-full bg-terracotta-500 px-6 text-sm font-medium text-white hover:bg-terracotta-600"
      >
        Back to home
      </Link>
    </div>
  );
}
