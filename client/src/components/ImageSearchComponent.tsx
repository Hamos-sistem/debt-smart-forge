import React, { useState, useRef } from "react";
import { Upload, Search, AlertCircle, CheckCircle, Loader } from "lucide-react";

/* ================= TYPES ================= */

type Props = {
  clientId: string;
  clientName?: string;
  onSearchComplete?: (data: any) => void;
  disabled?: boolean;
};

/* ================= COMPONENT ================= */

export default function ImageSearchComponent({
  clientId,
  clientName,
  onSearchComplete,
  disabled = false,
}: Props) {

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "done">("idle");

  const inputRef = useRef<HTMLInputElement>(null);

  /* ================= FILE SELECT ================= */

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!f.type.startsWith("image/")) {
      return setError("Invalid image");
    }

    setFile(f);
    setError("");

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  /* ================= UPLOAD ================= */

  const uploadImage = async (file: File) => {
    const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloud || !preset) throw new Error("Cloudinary not configured");

    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", preset);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloud}/image/upload`,
      { method: "POST", body: fd }
    );

    const data = await res.json();
    if (!res.ok) throw new Error("Upload failed");

    return data.secure_url;
  };

  /* ================= SEARCH ================= */

  const handleSearch = async () => {
    if (!file) return setError("Select image");

    try {
      setLoading(true);
      setError("");

      // 1️⃣ upload
      const imageUrl = await uploadImage(file);

      // 2️⃣ save image in client (🔥 مهم)
      await fetch("/api/clients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: clientId,
          attachment_url: imageUrl,
        }),
      });

      // 3️⃣ OSINT search
      const res = await fetch("/api/osint/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: clientName,
          clientId,
          photoUrl: imageUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatus("done");
      onSearchComplete?.(data);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="rounded-xl border bg-white p-5">

      <h3 className="font-bold mb-3">Image Search (OSINT)</h3>

      {/* upload */}
      <label className="block border-2 border-dashed p-4 text-center cursor-pointer">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />

        {preview ? (
          <img src={preview} className="h-32 mx-auto rounded" />
        ) : (
          <>
            <Upload className="mx-auto mb-2" />
            <p>Upload Image</p>
          </>
        )}
      </label>

      {/* error */}
      {error && (
        <div className="mt-2 text-red-600 text-sm flex gap-1">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* buttons */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleSearch}
          disabled={!file || loading || disabled}
          className="flex-1 bg-indigo-600 text-white py-2 rounded flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader size={16} className="animate-spin" />
              Searching
            </>
          ) : (
            <>
              <Search size={16} />
              Search
            </>
          )}
        </button>
      </div>

      {/* success */}
      {status === "done" && (
        <div className="mt-3 text-green-600 text-sm flex gap-1">
          <CheckCircle size={14} /> Search completed
        </div>
      )}
    </div>
  );
  }
