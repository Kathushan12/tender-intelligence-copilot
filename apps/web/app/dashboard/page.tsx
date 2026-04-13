"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Tender = {
  id: number;
  title: string;
  tender_number?: string | null;
  issuing_authority?: string | null;
  description?: string | null;
  status: string;
  owner_id: number;
  created_at: string;
  updated_at: string;
};

type User = {
  id: number;
  full_name: string;
  email: string;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [title, setTitle] = useState("");
  const [tenderNumber, setTenderNumber] = useState("");
  const [issuingAuthority, setIssuingAuthority] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function loadDashboard() {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const me = await apiFetch<User>("/api/v1/auth/me", undefined, token);
      const tenderList = await apiFetch<Tender[]>("/api/v1/tenders", undefined, token);

      setUser(me);
      setTenders(tenderList);
    } catch {
      localStorage.removeItem("token");
      router.push("/login");
      return;
    } finally {
      setLoading(false);
    }
  }

  async function createTender() {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    if (!title.trim()) {
      setError("Tender title is required");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const newTender = await apiFetch<Tender>(
        "/api/v1/tenders",
        {
          method: "POST",
          body: JSON.stringify({
            title,
            tender_number: tenderNumber || null,
            issuing_authority: issuingAuthority || null,
            description: description || null,
            status: "draft",
          }),
        },
        token
      );

      setTenders((prev) => [newTender, ...prev]);
      setTitle("");
      setTenderNumber("");
      setIssuingAuthority("");
      setDescription("");
    } catch {
      setError("Failed to create tender");
    } finally {
      setCreating(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <main className="mx-auto min-h-screen max-w-5xl px-6 py-12">
        <p className="text-sm text-muted-foreground">Loading dashboard...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tender Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Welcome{user ? `, ${user.full_name}` : ""}.
          </p>
        </div>

        <button
          onClick={logout}
          className="rounded-xl border px-4 py-2 font-medium"
        >
          Logout
        </button>
      </div>

      <div className="mt-8 rounded-2xl border p-6">
        <h2 className="text-lg font-semibold">Create Tender</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Title</label>
            <input
              className="w-full rounded-xl border px-3 py-2 outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Road Rehabilitation Tender"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Tender Number
            </label>
            <input
              className="w-full rounded-xl border px-3 py-2 outline-none"
              value={tenderNumber}
              onChange={(e) => setTenderNumber(e.target.value)}
              placeholder="RDA/2026/001"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Issuing Authority
            </label>
            <input
              className="w-full rounded-xl border px-3 py-2 outline-none"
              value={issuingAuthority}
              onChange={(e) => setIssuingAuthority(e.target.value)}
              placeholder="Road Development Authority"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Status</label>
            <input
              className="w-full rounded-xl border px-3 py-2 bg-muted"
              value="draft"
              readOnly
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium">Description</label>
          <textarea
            className="min-h-[120px] w-full rounded-xl border px-3 py-2 outline-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tender for road rehabilitation works"
          />
        </div>

        {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}

        <button
          onClick={createTender}
          disabled={creating}
          className="mt-6 rounded-xl border px-4 py-2 font-medium"
        >
          {creating ? "Creating..." : "Create Tender"}
        </button>
      </div>

      <div className="mt-8 rounded-2xl border p-6">
        <h2 className="text-lg font-semibold">My Tenders</h2>

        {tenders.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No tenders created yet.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {tenders.map((tender) => (
              <div key={tender.id} className="rounded-xl border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">{tender.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Status: {tender.status}
                    </p>

                    {tender.tender_number ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        Tender No: {tender.tender_number}
                      </p>
                    ) : null}

                    {tender.issuing_authority ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        Issuing Authority: {tender.issuing_authority}
                      </p>
                    ) : null}

                    {tender.description ? (
                      <p className="mt-2 text-sm">{tender.description}</p>
                    ) : null}

                    <div className="mt-3 flex gap-3">
                      <Link
                        href={`/tenders/${tender.id}/documents`}
                        className="inline-block rounded-lg border px-3 py-2 text-sm font-medium"
                      >
                        Open Documents
                      </Link>

                      <Link
                        href={`/tenders/${tender.id}/search`}
                        className="inline-block rounded-lg border px-3 py-2 text-sm font-medium"
                      >
                        Search
                      </Link>
                    </div>
                  </div>

                  <span className="rounded-full border px-3 py-1 text-xs">
                    #{tender.id}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}