import { useState } from "react";
import { ChevronDown } from "lucide-react";

type AdvancedSearchProps = {
  onSearch: (query: string, filters: any) => Promise<void>;
  loading: boolean;
};

export default function AdvancedClientSearch({ onSearch, loading }: AdvancedSearchProps) {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    accountType: [] as string[],
    loanType: [] as string[],
    bucketMin: undefined as number | undefined,
    bucketMax: undefined as number | undefined,
    amountDueMin: undefined as number | undefined,
    amountDueMax: undefined as number | undefined,
    promiseStatus: "",
  });

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleCheckbox = (key: "accountType" | "loanType", value: string) => {
    setFilters(prev => {
      const currentList = prev[key] || [];
      return {
        ...prev,
        [key]: currentList.includes(value)
          ? currentList.filter(v => v !== value)
          : [...currentList, value],
      };
    });
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    await onSearch(query, filters);
  };

  const hasActiveFilters = 
    filters.accountType.length > 0 ||
    filters.loanType.length > 0 ||
    filters.bucketMin !== undefined ||
    filters.bucketMax !== undefined ||
    filters.amountDueMin !== undefined ||
    filters.amountDueMax !== undefined ||
    filters.promiseStatus;

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm space-y-4">
      {/* Search Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search by name, phone, email, company... (e.g., 'high-risk clients in tech')"
          className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          {loading ? "Searching..." : "Search 🤖"}
        </button>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition flex items-center gap-1 ${
            hasActiveFilters
              ? "bg-indigo-100 text-indigo-700 border border-indigo-300"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Filters {hasActiveFilters && `(${Object.values(filters).filter(v => v && (Array.isArray(v) ? v.length > 0 : true)).length})`}
          <ChevronDown size={16} className={`transition ${showFilters ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="border-t pt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Account Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Account Status</label>
            <div className="space-y-2">
              {["Active", "Written Off"].map(type => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.accountType.includes(type)}
                    onChange={() => toggleCheckbox("accountType", type)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Loan Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Loan Type</label>
            <div className="space-y-2">
              {["Personal Loan", "Car Loan", "Credit Card"].map(type => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.loanType.includes(type)}
                    onChange={() => toggleCheckbox("loanType", type)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Bucket Range */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Bucket (Months)</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.bucketMin ?? ""}
                onChange={(e) => handleFilterChange("bucketMin", e.target.value ? Number(e.target.value) : undefined)}
                className="w-1/2 rounded-lg border px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.bucketMax ?? ""}
                onChange={(e) => handleFilterChange("bucketMax", e.target.value ? Number(e.target.value) : undefined)}
                className="w-1/2 rounded-lg border px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Amount Due Range */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Amount Due</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.amountDueMin ?? ""}
                onChange={(e) => handleFilterChange("amountDueMin", e.target.value ? Number(e.target.value) : undefined)}
                className="w-1/2 rounded-lg border px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.amountDueMax ?? ""}
                onChange={(e) => handleFilterChange("amountDueMax", e.target.value ? Number(e.target.value) : undefined)}
                className="w-1/2 rounded-lg border px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Promise Status */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Promise Status</label>
            <select
              value={filters.promiseStatus}
              onChange={(e) => handleFilterChange("promiseStatus", e.target.value)}
              className="w-full rounded-lg border px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All</option>
              <option value="Promised">Promised</option>
              <option value="Broken">Broken</option>
              <option value="Kept">Kept</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="flex items-end">
            <button
              onClick={() => setFilters({
                accountType: [],
                loanType: [],
                bucketMin: undefined,
                bucketMax: undefined,
                amountDueMin: undefined,
                amountDueMax: undefined,
                promiseStatus: "",
              })}
              className="w-full rounded-lg bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-300 transition"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      <p className="text-[10px] text-gray-400 uppercase tracking-wider">
        💡 Tip: Use natural language like "high-risk clients" or "overdue payments" for AI-powered search
      </p>
    </div>
  );
}
