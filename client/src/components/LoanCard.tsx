import React from "react";
import {
  formatCurrency,
  safeNumber,
  calculatePenalty,
  calculateEmiPlusPen,
  calculateAmountDue,
  shouldTerminateContract,
  getContractTerminationMonths
} from "@/lib/utils";

import {
  AlertCircle,
  TrendingDown,
  Gavel,
  Calendar,
  Bell,
  Edit,
  Trash2
} from "lucide-react";

/* ================= TYPES ================= */

type Loan = {
  id: string;
  loan_number?: string | null;
  loan_type: string;
  emi: number | string;
  bucket: number | string;
  balance: number | string;
  amount_due: number | string;
  account_type: string;
  cycle_date?: string | null;
  next_payment_date?: string | null;
  reminder_days?: number | null;
  promise_date?: string | null;
};

type Props = {
  loan: Loan;
  onEdit: (loan: Loan) => void;
  onDelete: (id: string) => void;
};

/* ================= COMPONENT ================= */

export default function LoanCard({ loan, onEdit, onDelete }: Props) {
  const emi = safeNumber(loan.emi);
  const bucket = safeNumber(loan.bucket);
  const balance = safeNumber(loan.balance);

  const accountType = loan.account_type || "Active";
  const loanType = loan.loan_type || "Personal Loan";

  /* ================= CALCULATIONS ================= */

  const penalty =
    accountType === "Active" &&
    (loanType === "Personal Loan" || loanType === "VSBL")
      ? calculatePenalty(emi, bucket)
      : 0;

  const emiPlusPen = calculateEmiPlusPen(
    emi,
    bucket,
    accountType,
    loanType
  );

  const amountDue = calculateAmountDue(emiPlusPen, bucket);

  const isHighRisk = bucket > 6;
  const isOverdue = bucket > 3;
  const isTerminated = shouldTerminateContract(bucket, loanType);
  const terminationMonths = getContractTerminationMonths(loanType);

  /* ================= UI ================= */

  return (
    <div
      className={`rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md ${
        isTerminated ? "border-red-300 bg-red-50/30" : ""
      }`}
    >
      {/* HEADER */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-gray-900">{loanType}</h3>

            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                accountType === "Active"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {accountType}
            </span>
          </div>

          <p className="text-sm text-gray-500">
            Loan #: {loan.loan_number || "N/A"}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(loan)}
            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
          >
            <Edit size={16} />
          </button>

          <button
            onClick={() => onDelete(loan.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* LEGAL WARNING */}
      {isTerminated && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 animate-pulse">
          <Gavel size={16} />
          <span className="text-xs font-bold">
            Legal Action Required ({terminationMonths}m exceeded)
          </span>
        </div>
      )}

      {/* DATA GRID */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 uppercase font-semibold">EMI</p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(emi)}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500 uppercase font-semibold">
            Bucket
          </p>
          <div className="flex items-center gap-1">
            <p className="text-lg font-bold text-gray-900">{bucket}</p>
            {isOverdue && (
              <TrendingDown size={14} className="text-orange-500" />
            )}
            {isHighRisk && (
              <AlertCircle size={14} className="text-red-500" />
            )}
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500 uppercase font-semibold">
            Balance
          </p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(balance)}
          </p>
        </div>

        <div>
          <p className="text-xs text-red-600 uppercase font-semibold">
            Amount Due
          </p>
          <p className="text-lg font-bold text-red-600">
            {formatCurrency(amountDue)}
          </p>
        </div>
      </div>

      {/* DATES */}
      <div className="border-t pt-4 space-y-2">
        {loan.next_payment_date && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 flex items-center gap-1">
              <Calendar size={14} /> Next Payment
            </span>
            <span className="font-medium text-gray-900">
              {new Date(loan.next_payment_date).toLocaleDateString()}
            </span>
          </div>
        )}

        {loan.promise_date && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 flex items-center gap-1">
              <Bell size={14} /> Promise Date
            </span>
            <span className="font-medium text-indigo-600">
              {new Date(loan.promise_date).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
    }
