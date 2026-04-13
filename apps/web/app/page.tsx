import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-16">
        <div className="space-y-6">
          <span className="inline-flex rounded-full border px-3 py-1 text-sm">
            Tender Intelligence Copilot
          </span>

          <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl">
            AI-powered tender analysis, compliance review, and risk intelligence
          </h1>

          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
            Upload tender documents, extract requirements, flag risky clauses,
            and ask grounded questions with citations.
          </p>

          <div className="flex gap-3">
            <Link
              href="/login"
              className="rounded-xl border px-5 py-3 font-medium"
            >
              Login
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl border px-5 py-3 font-medium"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}