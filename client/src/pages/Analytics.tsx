import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { trpc } from "@/lib/trpc";

export default function Analytics() {
  const { data: metrics } = trpc.dashboard.metrics.useQuery();

  const chartData = [
    { name: "النشطة", value: metrics?.activeAccounts || 0 },
    { name: "المكتوبة", value: metrics?.writtenOffAccounts || 0 },
    { name: "المتأخرة", value: metrics?.overdueAccounts || 0 },
  ];

  const COLORS = ["#3b82f6", "#ef4444", "#f59e0b"];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">التحليلات والتقارير</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">توزيع الحسابات</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Pie Chart */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">نسبة الحسابات</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Summary */}
        <Card className="p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">ملخص المحفظة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">إجمالي الرصيد</p>
              <p className="text-2xl font-bold">${(metrics?.totalBalance || 0).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-600">إجمالي المستحقات</p>
              <p className="text-2xl font-bold">${(metrics?.totalAmountDue || 0).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-600">نسبة التحصيل</p>
              <p className="text-2xl font-bold">
                {metrics?.totalBalance ? ((metrics.totalAmountDue / metrics.totalBalance) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div>
              <p className="text-gray-600">العملاء عالي الخطورة</p>
              <p className="text-2xl font-bold">{metrics?.highRiskClients || 0}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
