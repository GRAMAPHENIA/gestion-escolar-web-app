"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface RecentGrade {
  id: string;
  grade: number | null;
  student_name: string;
  subject_name: string;
  course_name: string;
  date: string;
}

interface RecentActivityCardProps {
  grades: RecentGrade[];
  className?: string;
}

export function RecentActivityCard({
  grades,
  className,
}: RecentActivityCardProps) {
  const getGradeColor = (grade: number | null) => {
    if (grade === null)
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    if (grade >= 7)
      return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200";
    if (grade >= 4)
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200";
    return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200";
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "d 'de' MMMM 'a las' HH:mm", { locale: es });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Calificaciones Recientes
            </CardTitle>
            <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
              Últimas notas registradas en el sistema
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/notas">Ver todas</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {grades.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {grades.map((grade) => (
              <div
                key={grade.id}
                className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-mono font-medium text-sm px-2 py-1 rounded-md",
                          getGradeColor(grade.grade)
                        )}
                      >
                        {grade.grade !== null ? grade.grade.toFixed(1) : "N/A"}
                      </Badge>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {grade.student_name}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 truncate">
                      {grade.subject_name} • {grade.course_name}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                      {formatDate(grade.date)}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/notas/${grade.id}`}>
                      <span className="sr-only">Ver detalles</span>
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
                      >
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No hay calificaciones recientes
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
