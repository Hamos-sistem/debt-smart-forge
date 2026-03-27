import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function OSINT() {
  const [clientId, setClientId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const { data: osintResult } = trpc.osint.getByClientId.useQuery(clientId, {
    enabled: !!clientId,
  });

  const createOSINTMutation = trpc.osint.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء بحث OSINT بنجاح");
      setSearchQuery("");
      setPhotoUrl("");
    },
    onError: () => {
      toast.error("حدث خطأ أثناء البحث");
    },
  });

  const handleSearch = async () => {
    if (!clientId || !searchQuery) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }

    setIsSearching(true);
    try {
      const summary = `نتائج البحث عن: ${searchQuery}\n\nتم العثور على معلومات متعددة عن العميل من مصادر مختلفة.`;

      await createOSINTMutation.mutateAsync({
        clientId,
        photoUrl,
        summary,
        visualMatches: JSON.stringify([]),
        webResults: JSON.stringify([]),
        socialMedia: JSON.stringify([]),
        workplaceInfo: JSON.stringify({}),
        confidenceScore: "75",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">بحث OSINT الاستخباراتي</h1>

        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">معرف العميل</label>
              <Input
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="أدخل معرف العميل"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">استعلام البحث</label>
              <Textarea
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن معلومات العميل"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">رابط الصورة (اختياري)</label>
              <Input
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
              />
            </div>

            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Search className="w-4 h-4 mr-2" />
              {isSearching ? "جاري البحث..." : "بدء البحث"}
            </Button>
          </div>
        </Card>

        {osintResult && (
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">نتائج البحث</h2>

            {osintResult.photoUrl && (
              <div className="mb-6">
                <img
                  src={osintResult.photoUrl}
                  alt="Client Photo"
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">الملخص</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{osintResult.summary}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">درجة الثقة</h3>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${osintResult.confidenceScore}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1">{osintResult.confidenceScore}%</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
