"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  href: string;
  color: string;
  subtitle?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  href,
  color,
  subtitle,
  className,
}: StatsCardProps) {
  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-md dark:border-gray-700",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
          {title}
        </CardTitle>
        <div
          className={cn(
            "rounded-lg p-2",
            color.includes("text-") ? "" : "bg-primary/10 dark:bg-primary/20",
            color
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {subtitle}
          </p>
        )}
        <Button
          variant="ghost"
          asChild
          className="p-0 h-auto text-sm mt-3 text-primary hover:text-primary/90 hover:bg-transparent dark:text-primary-400 dark:hover:text-primary-300"
        >
          <Link href={href} className="flex items-center gap-1">
            Ver todos
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ml-1"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
