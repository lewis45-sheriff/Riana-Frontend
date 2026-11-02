"use client";

import { AskPanel } from "@/components/dashboard/AskPanel";
import { Card, CardBody } from "@/components/ui/Card";

export default function AskPage() {
  return (
    <div className="w-full">
      <Card>
        <CardBody>
          <AskPanel />
        </CardBody>
      </Card>
    </div>
  );
}
