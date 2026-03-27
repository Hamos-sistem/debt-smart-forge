import React, { useState } from "react";

type Props = {
  title?: string;
};

export default function FaceMatchTest({ title = "Face Match Test" }: Props) {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  function handleCompare() {
    if (!file1 || !file2) {
      setResult("Please choose two images first.");
      return;
    }

    setLoading(true);

    // Placeholder local comparison logic.
    // Replace later with face-api.js or server-side matching if needed.
    setTimeout(() => {
      const score = Math.floor(Math.random() * 100);
      setResult(`Comparison completed. Similarity score: ${score}%`);
      setLoading(false);
    }, 1200);
  }

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-gray-500">
          Upload two images and compare them locally.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">Image 1</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile1(e.target.files?.[0] || null)}
            className="block w-full text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Image 2</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile2(e.target.files?.[0] || null)}
            className="block w-full text-sm"
          />
        </div>
      </div>

      <button
        onClick={handleCompare}
        disabled={loading}
        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? "Comparing..." : "Compare Faces"}
      </button>

      {result ? (
        <div className="rounded-lg border bg-gray-50 px-3 py-2 text-sm text-gray-700">
          {result}
        </div>
      ) : null}
    </div>
  );
      }
