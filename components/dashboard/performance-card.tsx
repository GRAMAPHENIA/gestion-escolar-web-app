"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { LucideIcon } from "lucide-react"

interface PerformanceItem {
  student_name: string
  course_name: string
  average: number
}

interface PerformanceCardProps {
  title: string
  description: string
  icon: LucideIcon
  items: PerformanceItem[]
  type: "high" | "low"
  emptyMessage: string
}

export function PerformanceCard({ title, description, icon: Icon, items, type, emptyMessage }: PerformanceCardProps) {
  const getCardStyle = () => {
    return type === "high" ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"
  }

  const getBadgeStyle = () => {
    return type === "high"
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
  }

  const getIconColor = () => {
    return type === "high" ? "text-green-600" : "text-red-600"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${getIconColor()}`} />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.length > 0 ? (
            items.map((item, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${getCardStyle()}`}>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{item.student_name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.course_name}</p>
                </div>
                <Badge className={getBadgeStyle()}>{item.average.toFixed(1)}</Badge>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">{emptyMessage}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
