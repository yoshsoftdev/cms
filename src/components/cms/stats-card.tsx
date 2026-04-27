"use client";

import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  description?: string;
}

export function StatsCard({ title, value, icon: Icon, description }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-500">{title}</p>
            <p className="mt-1 text-3xl font-bold text-neutral-900">{value}</p>
            {description ? <p className="mt-1 text-xs text-neutral-500">{description}</p> : null}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100">
            <Icon className="h-6 w-6 text-neutral-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
