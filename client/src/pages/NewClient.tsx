import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function NewClient() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    email: "",
    company: "",
    address: "",
  });

  const createMutation = trpc.clients.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة العميل بنجاح");
      navigate("/clients");
    },
    onError: () => {
      toast.error("حدث خطأ أثناء إضافة العميل");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.phone) {
      toast.error("يرجى ملء الحقول المطلوبة");
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">إضافة عميل جديد</h1>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">الاسم *</label>
              <Input
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="اسم العميل"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">الهاتف *</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="رقم الهاتف"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="البريد الإلكتروني"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">الشركة</label>
              <Input
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="اسم الشركة"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">العنوان</label>
              <Textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="العنوان"
                rows={3}
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {createMutation.isPending ? "جاري الحفظ..." : "حفظ"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/clients")}
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
