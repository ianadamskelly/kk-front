"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch, imageUrl, type ProductImage } from "@/lib/api";
import { getToken } from "@/lib/auth";
import Spinner from "@/components/Spinner";

interface Props {
  productId: number;
  /** Called whenever the gallery changes so the parent can refresh its
   *  cached product list (cover URL updates etc.). */
  onChange?: () => void;
}

// ProductImages is the admin gallery manager: upload, reorder, set
// cover, delete. It owns its own state and is only mounted after the
// product has been saved at least once (we need a real product id).
export default function ProductImages({ productId, onChange }: Props) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch(
        `/api/admin/products/${productId}/images`,
        getToken() || "",
      );
      if (!res.ok) throw new Error("Failed to load images");
      setImages((await res.json()) || []);
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
      const up = await adminFetch("/api/admin/upload", getToken() || "", {
        method: "POST",
        body: fd,
      });
      const upData = await up.json();
      if (!up.ok) throw new Error(upData.error || "Upload failed");

      const attach = await adminFetch(
        `/api/admin/products/${productId}/images`,
        getToken() || "",
        { method: "POST", body: JSON.stringify({ url: upData.url }) },
      );
      const attached = await attach.json();
      if (!attach.ok) throw new Error(attached.error || "Could not attach image");
      setImages((list) => [...list, attached]);
      onChange?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload error");
    } finally {
      setUploading(false);
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = images.slice();
    [next[index], next[target]] = [next[target], next[index]];
    setImages(next);
    await adminFetch(
      `/api/admin/products/${productId}/images/order`,
      getToken() || "",
      { method: "PUT", body: JSON.stringify({ ids: next.map((i) => i.id) }) },
    );
    onChange?.();
  };

  const setCover = async (imageId: number) => {
    const next = images.map((i) => ({ ...i, isCover: i.id === imageId }));
    setImages(next);
    const res = await adminFetch(
      `/api/admin/products/${productId}/images/${imageId}/cover`,
      getToken() || "",
      { method: "PUT" },
    );
    if (!res.ok) {
      setError("Could not set cover");
      load();
      return;
    }
    onChange?.();
  };

  const remove = async (imageId: number) => {
    if (!confirm("Remove this image?")) return;
    const res = await adminFetch(
      `/api/admin/products/${productId}/images/${imageId}`,
      getToken() || "",
      { method: "DELETE" },
    );
    if (!res.ok) {
      setError("Could not delete image");
      return;
    }
    // Reload so cover promotion (server-side) is reflected.
    await load();
    onChange?.();
  };

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-ink">Gallery</h3>
          <p className="text-xs text-ink/55">
            First image is the cover by default. Reorder with the arrows, or
            mark any image as cover.
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-brand-500 px-4 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50">
          {uploading ? (
            <>
              <Spinner size="sm" className="text-brand-500" />
              Uploading…
            </>
          ) : (
            "+ Add image"
          )}
          <input
            type="file"
            accept="image/*"
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
          <Spinner size="sm" /> Loading gallery…
        </div>
      ) : images.length === 0 ? (
        <p className="mt-4 text-sm text-ink/50">
          No images yet. Upload one to make it the cover automatically.
        </p>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {images.map((img, idx) => (
            <li
              key={img.id}
              className={`relative overflow-hidden rounded-lg border ${
                img.isCover ? "border-brand-500" : "border-ink/10"
              } bg-ink/[0.02]`}
            >
              <div className="aspect-square w-full">
                <img
                  src={imageUrl(img.url)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              {img.isCover && (
                <span className="absolute left-2 top-2 rounded-full bg-brand-500 px-2 py-0.5 text-xs font-semibold text-white">
                  Cover
                </span>
              )}
              <div className="flex items-center justify-between gap-1 border-t border-ink/10 bg-white px-2 py-1.5 text-xs">
                <div className="flex gap-1">
                  <button
                    type="button"
                    title="Move left"
                    disabled={idx === 0}
                    onClick={() => move(idx, -1)}
                    className="rounded px-1.5 py-0.5 text-ink/60 hover:bg-ink/5 disabled:opacity-30"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    title="Move right"
                    disabled={idx === images.length - 1}
                    onClick={() => move(idx, 1)}
                    className="rounded px-1.5 py-0.5 text-ink/60 hover:bg-ink/5 disabled:opacity-30"
                  >
                    →
                  </button>
                </div>
                <div className="flex gap-1">
                  {!img.isCover && (
                    <button
                      type="button"
                      onClick={() => setCover(img.id)}
                      className="rounded px-2 py-0.5 text-brand-600 hover:bg-brand-50"
                    >
                      Set cover
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(img.id)}
                    className="rounded px-2 py-0.5 text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
