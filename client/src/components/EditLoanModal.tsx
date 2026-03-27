import React, { useState, useEffect, useMemo } from "react";
import { X, Save } from "lucide-react";
import { calculateFinancials, formatCurrency } from "@/lib/utils";

/* ================= TYPES ================= */

type Loan = {
  id?: string;
  client_id?: string;
  loan_number?: string | null;
  loan_type: "PIL" | "VSBL" | "AUTO" | "CC";
  emi: number;
  balance: number;
  due_date?: string | null;
  account_type: string;
};

type Props = {
  loan: Loan | null;
  clientId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (loan: Loan) => void;
};

/* ================= COMPONENT ================= */

export default function EditLoanModal({
  loan,
  clientId,
  isOpen,
  onClose,
  onUpdate
}: Props) {

  const [formData, setFormData] = useState<Loan>({
    client_id: clientId,
    loan_type: "PIL",
    emi: 0,
    balance: 0,
    due_date: "",
    account_type: "Active"
  });

  const [loading, setLoading] = useState(false);

  /* ================= INIT ================= */

  useEffect(() => {
    if (loan) {
      setFormData({
        ...loan,
        loan_type: loan.loan_type as any,
        emi: Number(loan.emi),
        balance: Number(loan.balance),
        due_date: loan.due_date
          ? loan.due_date.split("T")[0]
          : ""
      });
    } else {
      setFormData({
        client_id: clientId,
        loan_type: "PIL",
        emi: 0,
        balance: 0,
        due_date: "",
        account_type: "Active"
      });
    }
  }, [loan, clientId, isOpen]);

  if (!isOpen) return null;

  /* ================= CALCULATIONS ================= */

  const financial = useMemo(() => {
    return calculateFinancials({
      emi: formData.emi,
      balance: formData.balance,
      loanType: formData.loan_type,
      accountType: formData.account_type,
      dueDate: formData.due_date || undefined
    });
  }, [formData]);

  /* ================= HANDLERS ================= */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]:
        name === "emi" || name === "balance"
          ? Number(value)
          : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/loans", {
        method: formData.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed");

      onUpdate(data);
      onClose();

    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">

        {/* HEADER */}
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="font-bold text-lg">
            {formData.id ? "تعديل قرض" : "إضافة قرض"}
          </h2>

          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">

          <input
            name="loan_number"
            placeholder="Loan Number"
            value={formData.loan_number || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <select
            name="loan_type"
            value={formData.loan_type}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="PIL">Personal Loan (PIL)</option>
            <option value="VSBL">VSBL</option>
            <option value="AUTO">Auto</option>
            <option value="CC">Credit Card</option>
          </select>

          <input
            type="number"
            name="emi"
            placeholder="EMI"
            value={formData.emi}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <input
            type="number"
            name="balance"
            placeholder="Balance"
            value={formData.balance}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          {/* 🔥 أهم حاجة */}
          <input
            type="date"
            name="due_date"
            value={formData.due_date || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          {/* 🔥 LIVE RESULTS */}
          <div className="bg-gray-50 p-3 rounded space-y-1 text-sm">

            <div>Bucket: {financial.bucket} months</div>

            <div>
              EMI + Penalty: {formatCurrency(financial.emiPlusPen)}
            </div>

            <div className="text-red-600 font-bold">
              Amount Due: {formatCurrency(financial.amountDue)}
            </div>

          </div>

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
