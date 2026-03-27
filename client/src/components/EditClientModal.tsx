import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";

/* ================= TYPES ================= */

type Client = {
  id: string;
  customer_name?: string | null;
  email?: string | null;
  company?: string | null;
  address?: string | null;
  attachment_url?: string | null;
};

type Props = {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (client: Client) => void;
};

/* ================= COMPONENT ================= */

export default function EditClientModal({
  client,
  isOpen,
  onClose,
  onUpdate
}: Props) {
  const [formData, setFormData] = useState<Client>(client);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData(client);
  }, [client]);

  if (!isOpen) return null;

  /* ================= HANDLERS ================= */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/clients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Update failed");

      onUpdate(data);
      onClose();

    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">

        {/* HEADER */}
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="font-bold">Edit Client</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">

          <input
            name="customer_name"
            placeholder="Customer Name"
            value={formData.customer_name || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />

          <input
            name="email"
            placeholder="Email"
            value={formData.email || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <input
            name="company"
            placeholder="Company"
            value={formData.company || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <textarea
            name="address"
            placeholder="Address"
            value={formData.address || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          {/* IMAGE URL (مهم للـ OSINT) */}
          <input
            name="attachment_url"
            placeholder="Image URL"
            value={formData.attachment_url || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          {/* ACTIONS */}
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="border px-4 py-2 rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              {loading ? "Saving..." : <><Save size={16} /> Save</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
    }
