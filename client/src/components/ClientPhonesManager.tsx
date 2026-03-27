import React, { useState, useEffect } from "react";
import { Phone, Plus, Trash2, Star, AlertCircle } from "lucide-react";

type ClientPhone = {
  id: string;
  client_id: string;
  phone_number: string;
  phone_type: string;
  is_primary: boolean;
  verified: boolean;
};

type Props = {
  clientId: string;
  onUpdate?: () => void;
};

export default function ClientPhonesManager({ clientId, onUpdate }: Props) {
  const [phones, setPhones] = useState<ClientPhone[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [newPhone, setNewPhone] = useState("");
  const [phoneType, setPhoneType] = useState<"mobile" | "home" | "work">("mobile");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchPhones();
  }, [clientId]);

  async function fetchPhones() {
    try {
      setLoading(true);
      const res = await fetch(`/api/clients/phones?clientId=${clientId}`);
      const data = await res.json();
      setPhones(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddPhone() {
    if (!newPhone.trim()) {
      setError("Please enter a phone number");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/clients/phones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          phone_number: newPhone,
          phone_type: phoneType,
          is_primary: phones.length === 0, // First phone is primary
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Failed to add phone");
      }

      setNewPhone("");
      setShowForm(false);
      await fetchPhones();
      onUpdate?.();
    } catch (err: any) {
      setError(err?.message || "Error adding phone");
    } finally {
      setLoading(false);
    }
  }

  async function handleSetPrimary(phoneId: string) {
    try {
      setLoading(true);
      const res = await fetch("/api/clients/phones", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: phoneId,
          is_primary: true,
        }),
      });

      if (!res.ok) throw new Error("Failed to update phone");
      await fetchPhones();
      onUpdate?.();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeletePhone(phoneId: string) {
    if (!confirm("Are you sure you want to delete this phone number?")) return;

    try {
      setLoading(true);
      const res = await fetch("/api/clients/phones", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: phoneId }),
      });

      if (!res.ok) throw new Error("Failed to delete phone");
      await fetchPhones();
      onUpdate?.();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Phone size={20} /> Phone Numbers
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition"
        >
          <Plus size={16} /> Add Phone
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 flex gap-2">
          <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Add Phone Form */}
      {showForm && (
        <div className="mb-4 rounded-lg border border-indigo-200 bg-indigo-50 p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="Enter phone number"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={phoneType}
              onChange={(e) => setPhoneType(e.target.value as any)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="mobile">Mobile</option>
              <option value="home">Home</option>
              <option value="work">Work</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddPhone}
              disabled={loading}
              className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              Add
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Phone List */}
      {loading && phones.length === 0 ? (
        <div className="text-center py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading phones...</p>
        </div>
      ) : phones.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center">
          <p className="text-sm text-gray-500">No phone numbers added yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {phones.map((phone) => (
            <div
              key={phone.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 hover:bg-gray-100 transition"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">{phone.phone_number}</p>
                  {phone.is_primary && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                      <Star size={12} /> Primary
                    </span>
                  )}
                  {phone.verified && (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      ✓ Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 capitalize mt-1">{phone.phone_type}</p>
              </div>
              <div className="flex items-center gap-2">
                {!phone.is_primary && (
                  <button
                    onClick={() => handleSetPrimary(phone.id)}
                    disabled={loading}
                    className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition"
                    title="Set as primary"
                  >
                    <Star size={16} />
                  </button>
                )}
                <button
                  onClick={() => handleDeletePhone(phone.id)}
                  disabled={loading}
                  className="p-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50 transition"
                  title="Delete phone"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
