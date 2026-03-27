import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BarChart3, Users, TrendingUp, AlertCircle } from "lucide-react";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const { data: metrics } = trpc.dashboard.metrics.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold mb-4">Debt Smart Forge</h1>
          <p className="text-xl mb-8 opacity-90">نظام إدارة العملاء الذكي مع تحليل OSINT</p>
          <a href={getLoginUrl()}>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              تسجيل الدخول
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">لوحة التحكم</h1>
          <Button onClick={logout} variant="outline">
            تسجيل الخروج
          </Button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">إجمالي العملاء</p>
                <p className="text-3xl font-bold">{metrics?.totalClients || 0}</p>
              </div>
              <Users className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">الحسابات النشطة</p>
                <p className="text-3xl font-bold">{metrics?.activeAccounts || 0}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">الحسابات المتأخرة</p>
                <p className="text-3xl font-bold">{metrics?.overdueAccounts || 0}</p>
              </div>
              <AlertCircle className="w-12 h-12 text-red-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">إجمالي المستحقات</p>
                <p className="text-3xl font-bold">${(metrics?.totalAmountDue || 0).toFixed(0)}</p>
              </div>
              <BarChart3 className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/clients">
            <Card className="p-6 cursor-pointer hover:shadow-lg transition">
              <h3 className="text-lg font-semibold mb-2">إدارة العملاء</h3>
              <p className="text-gray-600">عرض وإضافة وتعديل بيانات العملاء</p>
            </Card>
          </Link>

          <Link href="/osint">
            <Card className="p-6 cursor-pointer hover:shadow-lg transition">
              <h3 className="text-lg font-semibold mb-2">بحث OSINT</h3>
              <p className="text-gray-600">البحث الاستخباراتي والصور</p>
            </Card>
          </Link>

          <Link href="/analytics">
            <Card className="p-6 cursor-pointer hover:shadow-lg transition">
              <h3 className="text-lg font-semibold mb-2">التحليلات</h3>
              <p className="text-gray-600">تقارير وإحصائيات المحفظة</p>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
