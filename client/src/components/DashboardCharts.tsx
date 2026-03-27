import React from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ChartData {
  portfolioOverview?: {
    personalLoans: number;
    carLoans: number;
    creditCards: number;
  };
  riskDistribution?: {
    low: number;
    medium: number;
    high: number;
  };
  monthlyRecovery?: Array<{
    month: string;
    recovered: number;
    target: number;
  }>;
}

const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

interface DashboardChartsProps {
  data: ChartData;
}

export default function DashboardCharts({ data }: DashboardChartsProps) {
  // Portfolio Overview Data
  const portfolioData = data.portfolioOverview
    ? [
        { name: "Personal Loans", value: data.portfolioOverview.personalLoans },
        { name: "Car Loans", value: data.portfolioOverview.carLoans },
        { name: "Credit Cards", value: data.portfolioOverview.creditCards },
      ]
    : [];

  // Risk Distribution Data
  const riskData = data.riskDistribution
    ? [
        { name: "Low Risk", value: data.riskDistribution.low, color: "#10b981" },
        { name: "Medium Risk", value: data.riskDistribution.medium, color: "#f59e0b" },
        { name: "High Risk", value: data.riskDistribution.high, color: "#ef4444" },
      ]
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Portfolio Overview - Pie Chart */}
      {portfolioData.length > 0 && (
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Portfolio Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={portfolioData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                {portfolioData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Risk Distribution - Bar Chart */}
      {riskData.length > 0 && (
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Risk Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={riskData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" radius={[8, 8, 0, 0]}>
                {riskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Monthly Recovery Trend - Line Chart */}
      {data.monthlyRecovery && data.monthlyRecovery.length > 0 && (
        <div className="rounded-xl border bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Monthly Recovery Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.monthlyRecovery}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="recovered" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} />
              <Line type="monotone" dataKey="target" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b" }} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
