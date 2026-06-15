import { Card, CardContent } from "@/components/ui/card";
import {
  REPORTING_EMPTY_TEXT_CLASS,
  REPORTING_SURFACE_CLASS,
} from "@/features/reporting/lib/colors";

export function ReportingLoadingState({ message }: { message: string }) {
  return (
    <Card className={REPORTING_SURFACE_CLASS}>
      <CardContent className="py-12">
        <p className={REPORTING_EMPTY_TEXT_CLASS}>{message}</p>
      </CardContent>
    </Card>
  );
}
