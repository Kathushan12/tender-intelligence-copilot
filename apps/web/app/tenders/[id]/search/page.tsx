"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type SearchResult = {
  document_id: number;
  page_number: number;
  chunk_index: number;
  chunk_text: string;
  char_count: number;
};

type User = {
  id: number;
  full_name: string;
  email: string;
  created_at: string;
};

export default function TenderSearchPage() {
  const params = useParams();
  const router = useRouter();
  const tenderId = params.id as string;

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"keyword" | "semantic">("semantic");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lastEndpoint, setLastEndpoint] = useState("");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const me = await apiFetch<User>("/api/v1/auth/me", undefined, token);
        setUser(me);
      } catch {
        localStorage.removeItem("token");
        router.push("/login");
      }
    }

    loadUser();
  }, [router]);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    if (!query.trim()) {
      setError("Enter a search query");
      setSuccess("");
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const endpoint =
        mode === "semantic"
          ? `/api/v1/semantic-search/tenders/${tenderId}`
          : `/api/v1/search/tenders/${tenderId}`;

      setLastEndpoint(endpoint);

      const data = await apiFetch<SearchResult[]>(
        endpoint,
        {
          method: "POST",
          body: JSON.stringify({ query }),
        },
        token
      );

      console.log("Search mode:", mode);
      console.log("Tender ID:", tenderId);
      console.log("Endpoint:", endpoint);
      console.log("User:", user);
      console.log("Results:", data);

      setResults(data);

      if (data.length === 0) {
        setSuccess("No results found.");
      } else {
        setSuccess(`Found ${data.length} result(s).`);
      }
    } catch (err) {
      console.error("Search failed:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Search failed");
      }

      setResults([]);
      setSuccess("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tender Search</h1>
          <p className="mt-2 text-muted-foreground">Tender ID: {tenderId}</p>
          {user ? (
            <p className="mt-1 text-sm text-muted-foreground">
              Logged in as: {user.email}
            </p>
          ) : null}
        </div>

        <div className="flex gap-3">
          <Link
            href={`/tenders/${tenderId}/documents`}
            className="rounded-xl border px-4 py-2 font-medium"
          >
            Documents
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl border px-4 py-2 font-medium"
          >
            Dashboard
          </Link>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setMode("semantic")}
              className={`rounded-xl border px-4 py-2 text-sm font-medium ${
                mode === "semantic" ? "bg-muted" : ""
              }`}
            >
              Semantic Search
            </button>

            <button
              type="button"
              onClick={() => setMode("keyword")}
              className={`rounded-xl border px-4 py-2 text-sm font-medium ${
                mode === "keyword" ? "bg-muted" : ""
              }`}
            >
              Keyword Search
            </button>
          </div>

          <p className="text-sm text-muted-foreground">
            Active mode: <span className="font-medium">{mode}</span>
          </p>

          {lastEndpoint ? (
            <p className="text-sm text-muted-foreground">
              Last endpoint: <span className="font-medium">{lastEndpoint}</span>
            </p>
          ) : null}

          <div>
            <label className="mb-2 block text-sm font-medium">Search query</label>
            <input
              className="w-full rounded-xl border px-3 py-2 outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your question or keyword"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl border px-4 py-2 font-medium"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
        {success ? <p className="mt-4 text-sm text-green-600">{success}</p> : null}
      </div>

      <div className="mt-8 rounded-2xl border p-6">
        <h2 className="text-lg font-semibold">Search Results</h2>

        {loading ? (
          <p className="mt-4 text-sm text-muted-foreground">Searching...</p>
        ) : results.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No results yet.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {results.map((result, index) => (
              <div key={index} className="rounded-xl border p-4">
                <p className="text-sm text-muted-foreground">
                  Document ID: {result.document_id} | Page: {result.page_number} | Chunk: {result.chunk_index}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm">{result.chunk_text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}