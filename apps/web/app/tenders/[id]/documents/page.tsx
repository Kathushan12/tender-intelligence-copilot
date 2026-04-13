"use client";

import { ChangeEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { API_BASE_URL, apiFetch } from "@/lib/api";

type DocumentItem = {
  id: number;
  tender_id: number;
  original_filename: string;
  stored_filename: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
};

export default function TenderDocumentsPage() {
  const params = useParams();
  const router = useRouter();
  const tenderId = params.id as string;

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [parsingId, setParsingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadDocuments() {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const data = await apiFetch<DocumentItem[]>(
        `/api/v1/documents/tenders/${tenderId}`,
        undefined,
        token
      );
      setDocuments(data);
    } catch {
      setError("Failed to load documents");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload() {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    if (!selectedFile) {
      setError("Please select a PDF file");
      return;
    }

    if (selectedFile.type !== "application/pdf") {
      setError("Only PDF files are allowed");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch(
        `${API_BASE_URL}/api/v1/documents/tenders/${tenderId}/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Upload failed");
      }

      const newDocument = await res.json();
      setDocuments((prev) => [newDocument, ...prev]);
      setSelectedFile(null);
      setSuccess("Document uploaded successfully");
    } catch {
      setError("Failed to upload document");
    } finally {
      setUploading(false);
    }
  }

  async function handleParse(documentId: number) {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setParsingId(documentId);
      setError("");
      setSuccess("");

      const res = await fetch(`${API_BASE_URL}/api/v1/documents/${documentId}/parse`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Parse failed");
      }

      const data = await res.json();
      setSuccess(
        `Parsed successfully: ${data.pages_count} pages, ${data.chunks_count} chunks`
      );
    } catch {
      setError("Failed to parse document");
    } finally {
      setParsingId(null);
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setError("");
    setSuccess("");
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tender Documents</h1>
          <p className="mt-2 text-muted-foreground">Tender ID: {tenderId}</p>
        </div>

        <Link
          href="/dashboard"
          className="rounded-xl border px-4 py-2 font-medium"
        >
          Back to Dashboard
        </Link>
      </div>

      <div className="mt-8 rounded-2xl border p-6">
        <h2 className="text-lg font-semibold">Upload PDF</h2>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <input type="file" accept="application/pdf" onChange={handleFileChange} />

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="rounded-xl border px-4 py-2 font-medium"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>

        {selectedFile ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Selected: {selectedFile.name}
          </p>
        ) : null}

        {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
        {success ? <p className="mt-4 text-sm text-green-600">{success}</p> : null}
      </div>

      <div className="mt-8 rounded-2xl border p-6">
        <h2 className="text-lg font-semibold">Uploaded Documents</h2>

        {loading ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        ) : documents.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No documents uploaded yet.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="rounded-xl border p-4">
                <h3 className="font-semibold">{doc.original_filename}</h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Type: {doc.file_type.toUpperCase()}
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Size: {doc.file_size} bytes
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Uploaded: {new Date(doc.created_at).toLocaleString()}
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Document ID: {doc.id}
                </p>

                <div className="mt-3">
                  <button
                    onClick={() => handleParse(doc.id)}
                    disabled={parsingId === doc.id}
                    className="rounded-lg border px-3 py-2 text-sm font-medium"
                  >
                    {parsingId === doc.id ? "Parsing..." : "Parse Document"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}