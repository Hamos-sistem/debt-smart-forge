import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Clients() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: clients, isLoading, refetch } = trpc.clients.list.useQuery();
  const { data: searchResults } = trpc.clients.search.useQuery(searchQuery, {
    enabled: searchQuery.length > 0,
  });
  const deleteClientMutation = trpc.clients.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف العميل بنجاح");
      refetch();
    },
    onError: () => {
      toast.error("حدث خطأ أثناء حذف العميل");
    },
  });

  const displayClients = searchQuery ? searchResults : clients;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">إدارة العملاء</h1>
          <Link href="/clients/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              عميل جديد
            </Button>
          </Link>
        </div>

        {/* Search */}
        <Card className="p-4 mb-6">
          <div className="flex gap-2">
            <Input
              placeholder="ابحث عن عميل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        {/* Clients List */}
        <div className="space-y-4">
          {isLoading ? (
            <p className="text-center text-gray-500">جاري التحميل...</p>
          ) : displayClients?.length === 0 ? (
            <p className="text-center text-gray-500">لا توجد عملاء</p>
          ) : (
            displayClients?.map((client: any) => (
              <Card key={client.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{client.customerName}</h3>
                    <p className="text-gray-600">{client.phone}</p>
                    <p className="text-sm text-gray-500">{client.company}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/clients/${client.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteClientMutation.mutate(client.id)}
                      disabled={deleteClientMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
