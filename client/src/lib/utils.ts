import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/* ================= UI ================= */

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ================= HELPERS ================= */

export function safeNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

/* ================= DATE / BUCKET ================= */

export function calculateBucketFromDate(dueDate?: string): number {
  if (!dueDate) return 0;

  const today = new Date();
  const due = new Date(dueDate);

  if (isNaN(due.getTime())) return 0;

  const diffDays = Math.floor(
    (today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays <= 0) return 0;

  return Math.floor(diffDays / 30) + 1;
}

export function daysFromBucket(bucket: number): number {
  return Math.max(0, safeNumber(bucket)) * 30;
}

/* ================= LOAN TYPES ================= */

export type LoanType = "PIL" | "VSBL" | "AUTO" | "CC";

/* 🔥 normalize أي قيمة جاية من DB أو UI */
export function normalizeLoanType(type?: string): LoanType {
  if (!type) return "PIL";

  const t = type.toUpperCase();

  if (t.includes("PERSONAL") || t === "PIL") return "PIL";
  if (t === "VSBL") return "VSBL";
  if (t.includes("CAR") || t.includes("AUTO")) return "AUTO";
  if (t.includes("CREDIT") || t === "CC") return "CC";

  return "PIL";
}

export function hasPenalty(loanType: string): boolean {
  const type = normalizeLoanType(loanType);
  return type === "PIL" || type === "VSBL";
}

/* ================= CALCULATIONS ================= */

export function calculatePenalty(
  emi: number,
  bucket: number,
  loanType: string = "PIL"
): number {
  const type = normalizeLoanType(loanType);

  if (!hasPenalty(type)) return 0;

  const safeEmi = safeNumber(emi);
  const days = daysFromBucket(bucket);

  const value = (safeEmi * (24 * days)) / 36000;

  return Number.isFinite(value) ? Number(value.toFixed(2)) : 0;
}

export function calculateEmiPlusPen(
  emi: number,
  bucket: number,
  accountType: string = "Active",
  loanType: string = "PIL",
  fixedFee: number = 125
): number {
  const baseEmi = safeNumber(emi);

  if (accountType === "Active" && hasPenalty(loanType)) {
    const penaltyValue = calculatePenalty(baseEmi, bucket, loanType);

    const value = baseEmi + penaltyValue + safeNumber(fixedFee);

    return Number.isFinite(value) ? Number(value.toFixed(2)) : 0;
  }

  return Number(baseEmi.toFixed(2));
}

export function calculateAmountDue(
  emiPlusPen: number,
  bucket: number
): number {
  const value = safeNumber(emiPlusPen) * safeNumber(bucket);
  return Number.isFinite(value) ? Number(value.toFixed(2)) : 0;
}

/* ================= CONTRACT ================= */

export function getContractTerminationMonths(loanType: string): number {
  const type = normalizeLoanType(loanType);
  return type === "VSBL" ? 12 : 6;
}

export function shouldTerminateContract(
  bucket: number,
  loanType: string
): boolean {
  return safeNumber(bucket) >= getContractTerminationMonths(loanType);
}

/* ================= FULL ENGINE ================= */

export function calculateFinancials({
  emi,
  bucket,
  balance,
  accountType = "Active",
  loanType = "PIL",
  dueDate,
}: {
  emi: number;
  bucket?: number;
  balance?: number;
  accountType?: string;
  loanType?: string;
  dueDate?: string;
}) {
  const type = normalizeLoanType(loanType);

  // 🔥 priority: bucket لو موجود → غير كده احسبه من التاريخ
  const finalBucket =
    bucket !== undefined && bucket !== null
      ? safeNumber(bucket)
      : calculateBucketFromDate(dueDate);

  const penalty = calculatePenalty(emi, finalBucket, type);

  const emiPlusPen = calculateEmiPlusPen(
    emi,
    finalBucket,
    accountType,
    type
  );

  const amountDue = calculateAmountDue(emiPlusPen, finalBucket);

  return {
    bucket: finalBucket,
    penalty,
    emiPlusPen,
    amountDue,
    balance: safeNumber(balance),
    loanType: type,
  };
  }
