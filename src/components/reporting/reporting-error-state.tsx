import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ReportingErrorState({ message }: { message: string }) {
  return (
    <Card className="border border-[#f3d1cb] bg-[#fff8f6] shadow-none">
      <CardContent className="flex items-start gap-3 pt-6">
        <AlertCircle className="mt-0.5 h-5 w-5 text-[#c45f2d]" />
        <div className="space-y-1">
          <p className="font-medium text-[#8a3e24]">Chargement impossible</p>
          <p className="text-sm text-[#9e5a3a]">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}
