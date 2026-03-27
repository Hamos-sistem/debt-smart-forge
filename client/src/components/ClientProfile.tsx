import React, { useMemo, useState, useEffect } from "react";
import ImageSearchOSINT from "@/components/ImageSearchOSINT";
import {
  calculateEmiPlusPen,
  calculateAmountDue,
  calculatePenalty,
  safeNumber,
  formatCurrency,
} from "@/lib/utils";

type Client = {
  id: string;
  customer_name?: string | null;
  phone?: string | null;
  email?: string | null;
  company?: string | null;
  address?: string | null;
  loan_number?: string | null;
  loan_type?: string | null;
  emi?: number | string | null;
  bucket?: number | string | null;
  balance?: number | string | null;
  amount_due?: number | string | null;
  account_type?: string | null;
  promise_status?: string | null;
};

type AIPrediction = {
  propensityToPay: number;
  riskLevel: string;
};

type Props = {
  client: Client;
  onRefresh?: () => void;
};

export default function ClientProfile({ client, onRefresh }: Props) {
  const [aiPrediction, setAiPrediction] = useState<AIPrediction | null>(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);

  useEffect(() => {
    const fetchPrediction = async () => {
      if (!client.id) return;
      setLoadingPrediction(true);
      try {
        const response = await fetch("/api/ai/predict_payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clientId: client.id,
            clientData: {
              emi: client.emi,
              bucket: client.bucket,
              balance: client.balance,
              accountType: client.account_type,
              loanType: client.loan_type,
            },
          }),
        });
        const data = await response.json();
        if (data.success) {
          setAiPrediction(data);
        }
      } catch (error) {
        console.error("Failed to fetch AI prediction:", error);
      } finally {
        setLoadingPrediction(false);
      }
    };
    fetchPrediction();
  }, [client]);
  const emi = safeNumber(client.emi);
  const bucket = safeNumber(client.bucket);
  const balance = safeNumber(client.balance);
  const accountType = client.account_type || "Active";
  const loanType = client.loan_type || "Personal Loan";

  const financialData = useMemo(() => {
    const pen = calculatePenalty(emi, bucket);
    const emiPlusPen = calculateEmiPlusPen(emi, bucket, accountType, loanType);
    const amountDue = calculateAmountDue(emiPlusPen, bucket);
    return { pen, emiPlusPen, amountDue };
  }, [emi, bucket, accountType, loanType]);

  const days = bucket * 30;
  const promiseStatus = client.promise_status || "None";

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {client.customer_name || "Unnamed Client"}
            </h1>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <div>Phone: {client.phone || "-"}</div>
              <div>Email: {client.email || "-"}</div>
              <div>Company: {client.company || "-"}</div>
              <div>Address: {client.address || "-"}</div>
              <div>Loan Number: {client.loan_number || "-"}</div>
              <div>Loan Type: {client.loan_type || "-"}</div>
            </div>
          </div>

          <div className="grid gap-2 text-sm md:min-w-[260px]">
            <div className="rounded-lg bg-gray-50 px-3 py-2">
              <span className="font-semibold">Account Type:</span> {accountType}
            </div>
            <div className="rounded-lg bg-gray-50 px-3 py-2">
              <span className="font-semibold">Promise Status:</span> {promiseStatus}
            </div>
            <div className="rounded-lg bg-gray-50 px-3 py-2">
              <span className="font-semibold">Bucket:</span> {bucket}
            </div>
            <div className="rounded-lg bg-gray-50 px-3 py-2">
              <span className="font-semibold">Days Late:</span> {days}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">EMI</div>
          <div className="mt-1 text-2xl font-bold">{formatCurrency(emi)}</div>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">Penalty</div>
          <div className="mt-1 text-2xl font-bold">{formatCurrency(financialData.pen)}</div>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">EMI + Pen</div>
          <div className="mt-1 text-2xl font-bold">{formatCurrency(financialData.emiPlusPen)}</div>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">Balance</div>
          <div className="mt-1 text-2xl font-bold">{formatCurrency(balance)}</div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Amount Due Breakdown</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between rounded-lg bg-gray-50 px-3 py-2">
              <span>EMI + Penalty + Fee</span>
              <span className="font-bold">{formatCurrency(financialData.emiPlusPen)}</span>
            </div>
            <div className="flex justify-between rounded-lg bg-gray-50 px-3 py-2">
              <span>Multiplied by Bucket</span>
              <span className="font-bold">× {bucket}</span>
            </div>
            <div className="flex justify-between rounded-lg bg-red-50 px-3 py-2 border border-red-200">
              <span className="font-bold">Total Amount Due</span>
              <span className="font-bold text-red-600">{formatCurrency(financialData.amountDue)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Quick Summary</h2>
          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <div>Amount Due: {formatCurrency(financialData.amountDue)}</div>
            <div>Account Type: {accountType}</div>
            <div>Promise Status: {promiseStatus}</div>
            {loadingPrediction ? (
              <div>Loading AI Prediction...</div>
            ) : aiPrediction ? (
              <>
                <div>Propensity to Pay: {(aiPrediction.propensityToPay * 100).toFixed(2)}%</div>
                <div>Risk Level: {aiPrediction.riskLevel}</div>
                <div>Suggested Strategy: {aiPrediction.riskLevel === "High" ? "Prioritize immediate contact and aggressive collection." : aiPrediction.riskLevel === "Medium" ? "Offer flexible payment plans and follow up regularly." : "Send automated reminders and monitor." }</div>
              </>
            ) : (
              <div>AI Prediction N/A</div>
            )}
          </div>

          {onRefresh ? (
            <button
              onClick={onRefresh}
              className="mt-4 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
            >
              Refresh Client
            </button>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">OSINT Search</h2>
        <p className="mt-1 text-sm text-gray-500">
          Search the client using uploaded image, file, name, phone, email, or company.
        </p>

        <div className="mt-4">
          <ImageSearchOSINT
            clientId={client.id}
            defaultName={client.customer_name || ""}
            defaultPhone={client.phone || ""}
            defaultEmail={client.email || ""}
            defaultCompany={client.company || ""}
          />
        </div>
      </div>
    </div>
  );
}
