"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch, type ProductDownload } from "@/lib/api";
import { getToken } from "@/lib/auth";
import Spinner from "@/components/Spinner";

interface Props {
  productId: number;
}

// formatBytes returns a compact human-readable size (e.g. "1.4 MB").
function formatBytes(n: number): string {
  if (!n) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let value = n;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${value.toFixed(value < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

// ProductDownloads manages the downloadable files attached to a
// digital product. Files are uploaded to /api/admin/upload-file, then
// attached via /api/admin/products/{id}/downloads. The URLs returned
// here are admin-only — customers reach them through signed tokens.
export default function ProductDownloads({ productId }: Props) {
  const [items, setItems] = useState<ProductDownload[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch(
        `/api/admin/products/${productId}/downloads`,
        getToken() || "",
      );
      if (!res.ok) throw new Error("Failed to load downloads");
      setItems((await res.json()) || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  const onUpload = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const up = await adminFetch("/api/admin/upload-file", getToken() || "", {
        method: "POST",
        body: fd,
      });
      const upData = await up.json();
      if (!up.ok) throw new Error(upData.error || "Upload failed");

      const attach = await adminFetch(
        `/api/admin/products/${productId}/downloads`,
        getToken() || "",
        {
          method: "POST",
          body: JSON.stringify({
            url: upData.url,
            label: upData.filename || file.name,
            sizeBytes: upData.sizeBytes ?? file.size,
          }),
        },
      );
      const attached = await attach.json();
      if (!attach.ok) throw new Error(attached.error || "Could not attach file");
      setItems((list) => [...list, attached]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload error");
    } finally {
      setUploading(false);
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = items.slice();
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    await adminFetch(
      `/api/admin/products/${productId}/downloads/order`,
      getToken() || "",
      { method: "PUT", body: JSON.stringify({ ids: next.map((i) => i.id) }) },
    );
  };

  const remove = async (downloadId: number) => {
    if (!confirm("Remove this file? The order email will no longer link to it.")) return;
    const res = await adminFetch(
      `/api/admin/products/${productId}/downloads/${downloadId}`,
      getToken() || "",
      { method: "DELETE" },
    );
    if (!res.ok) {
      setError("Could not delete file");
      return;
    }
    setItems((list) => list.filter((d) => d.id !== downloadId));
  };

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-ink">Downloadable files</h3>
          <p className="text-xs text-ink/55">
            Each customer who buys this product receives signed links to
            every file here. PDF, ZIP, EPUB, audio, etc. Max 100 MB per file.
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-brand-500 px-4 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50">
          {uploading ? (
            <>
              <Spinner size="sm" className="text-brand-500" />
              Uploading…
            </>
          ) : (
            "+ Add file"
          )}
          <input
            type="file"
            accept=".pdf,.zip,.epub,.mobi,.docx,.xlsx,.pptx,.txt,.csv,.mp3,.mp4,.m4a,.wav"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
              e.target.value = "";
            }}
            className="sr-only"
          />
        </label>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {loading ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-ink/50">
          <Spinner size="sm" /> Loading files…
        </div>
      ) : items.length === 0 ? (
        <p className="mt-4 text-sm text-ink/50">
          No files yet. Add at least one so customers have something to download
          after purchase.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-ink/10 rounded-lg border border-ink/10">
          {items.map((d, idx) => (
            <li
              key={d.id}
              className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">
                  {d.label || d.url.split("/").pop()}
                </p>
                <p className="text-xs text-ink/55">{formatBytes(d.sizeBytes)}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  title="Move up"
                  disabled={idx === 0}
                  onClick={() => move(idx, -1)}
                  className="rounded px-1.5 py-0.5 text-ink/60 hover:bg-ink/5 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  title="Move down"
                  disabled={idx === items.length - 1}
                  onClick={() => move(idx, 1)}
                  className="rounded px-1.5 py-0.5 text-ink/60 hover:bg-ink/5 disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => remove(d.id)}
                  className="rounded px-2 py-0.5 text-xs text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
