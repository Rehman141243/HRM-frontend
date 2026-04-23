"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ComingSoon({ title, description }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {description ||
            "This module UI will be added next. For now, navigation and layout are ready."}
        </p>
      </CardContent>
    </Card>
  );
}

