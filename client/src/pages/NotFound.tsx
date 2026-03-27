import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">الصفحة غير موجودة</p>
        <Link href="/">
          <Button className="bg-blue-600 hover:bg-blue-700">
            العودة للرئيسية
          </Button>
        </Link>
      </div>
    </div>
  );
}
