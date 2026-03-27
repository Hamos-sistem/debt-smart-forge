import React, { useRef, useState } from "react";

type VisualResult = {
  source?: string;
  thumbnail?: string;
  pageUrl?: string;
  title?: string;
  snippet?: string;
  score?: number;
};

type WebResult = {
  source?: string;
  title?: string;
  link?: string;
  snippet?: string;
};

type Props = {
  clientId?: string;
  defaultName?: string;
  defaultPhone?: string;
  defaultEmail?: string;
  defaultCompany?: string;
  onResults?: (data: {
    visualMatches: VisualResult[];
    webResults: WebResult[];
    notes: string[];
  }) => void;
};

export default function ImageSearchOSINT({
  clientId,
  defaultName = "",
  defaultPhone = "",
  defaultEmail = "",
  defaultCompany = "",
  onResults,
}: Props) {
  const imageRef = useRef<HTMLInputElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState(defaultPhone);
  const [email, setEmail] = useState(defaultEmail);
  const [company, setCompany] = useState(defaultCompany);

  const [loading, setLoading] = useState(false);
  const [visualResults, setVisualResults] = useState<VisualResult[]>([]);
  const [webResults, setWebResults] = useState<WebResult[]>([]);
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [fileUrl, setFileUrl] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [notes, setNotes] = useState<string[]>([]);

  async function uploadToCloudinary(file: File) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error("Cloudinary is not configured");
    }

    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", uploadPreset);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
      {
        method: "POST",
        body: form,
      }
    );

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json?.error?.message || "Cloudinary upload failed");
    }

    return json.secure_url as string;
  }

  async function handleSearch() {
    setError("");
    setNotes([]);
    setVisualResults([]);
    setWebResults([]);

    const imageFile = imageRef.current?.files?.[0] || null;
    const attachedFile = fileRef.current?.files?.[0] || null;

    if (!imageFile && !attachedFile && !name && !phone && !email && !company) {
      setError("Please enter search data or upload an image/file.");
      return;
    }

    setLoading(true);

    try {
      let uploadedImageUrl = "";
      let uploadedFileUrl = "";

      if (imageFile) {
        uploadedImageUrl = await uploadToCloudinary(imageFile);
        setPhotoUrl(uploadedImageUrl);
      }

      if (attachedFile) {
        uploadedFileUrl = await uploadToCloudinary(attachedFile);
        setFileUrl(uploadedFileUrl);
      }

      const response = await fetch("/api/osint/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: clientId || null,
          photoUrl: uploadedImageUrl || null,
          attachmentUrl: uploadedFileUrl || null,
          attachmentName: attachedFile?.name || null,
          name: name || null,
          phone: phone || null,
          email: email || null,
          company: company || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Search failed");
      }

      const visual = Array.isArray(data.visualMatches) ? data.visualMatches : [];
      const web = Array.isArray(data.webResults) ? data.webResults : [];
      const n = Array.isArray(data.notes) ? data.notes : [];

      setVisualResults(visual);
      setWebResults(web);
      setNotes(n);

      onResults?.({
        visualMatches: visual,
        webResults: web,
        notes: n,
      });
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm space-y-4">
      <div>
        <h3 className="text-lg font-semibold">OSINT Search</h3>
        <p className="text-sm text-gray-500">
          Search by name, phone, email, company, image, or uploaded file.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Client name"
          className="rounded-lg border px-3 py-2 text-sm"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone"
          className="rounded-lg border px-3 py-2 text-sm"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="rounded-lg border px-3 py-2 text-sm"
        />
        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Company"
          className="rounded-lg border px-3 py-2 text-sm"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">Image</label>
          <input ref={imageRef} type="file" accept="image/*" className="block w-full text-sm" />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">File</label>
          <input ref={fileRef} type="file" className="block w-full text-sm" />
        </div>
      </div>

      <button
        onClick={handleSearch}
        disabled={loading}
        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? "Searching..." : "Search"}
      </button>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {photoUrl ? (
        <div className="text-xs text-gray-500">
          Uploaded image:{" "}
          <a href={photoUrl} target="_blank" rel="noreferrer" className="underline">
            open
          </a>
        </div>
      ) : null}

      {fileUrl ? (
        <div className="text-xs text-gray-500">
          Uploaded file:{" "}
          <a href={fileUrl} target="_blank" rel="noreferrer" className="underline">
            open
          </a>
        </div>
      ) : null}

      {notes.length > 0 ? (
        <div className="rounded-lg border bg-gray-50 p-3">
          <h4 className="mb-2 text-sm font-semibold">Notes</h4>
          <ul className="list-disc space-y-1 pl-5 text-sm text-gray-600">
            {notes.map((note, index) => (
              <li key={index}>{note}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {visualResults.length > 0 ? (
        <div>
          <h4 className="mb-2 text-sm font-semibold">Visual Results</h4>
          <div className="grid gap-3 md:grid-cols-2">
            {visualResults.map((item, index) => (
              <div key={index} className="rounded-lg border p-3">
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.title || "match"}
                    className="mb-2 h-36 w-full rounded-md object-cover"
                  />
                ) : null}
                <div className="space-y-1 text-sm">
                  <div className="font-medium">{item.title || "Untitled"}</div>
                  {item.snippet ? <div className="text-gray-500">{item.snippet}</div> : null}
                  {item.pageUrl ? (
                    <a
                      href={item.pageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="break-all text-blue-600 underline"
                    >
                      {item.pageUrl}
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {webResults.length > 0 ? (
        <div>
          <h4 className="mb-2 text-sm font-semibold">Web Results</h4>
          <div className="space-y-3">
            {webResults.map((item, index) => (
              <div key={index} className="rounded-lg border p-3">
                <div className="text-sm font-medium">{item.title || "Untitled"}</div>
                {item.snippet ? (
                  <div className="mt-1 text-sm text-gray-500">{item.snippet}</div>
                ) : null}
                {item.link ? (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block break-all text-sm text-blue-600 underline"
                  >
                    {item.link}
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
