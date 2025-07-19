"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, AlertTriangle, TrendingDown, X, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase-updated"

interface Notification {
  id: string
  type: "low_performance" | "no_grades" | "high_performance" | "system"
  title: string
  message: string
  student_id?: string
  student_name?: string
  course_name?: string
  priority: "high" | "medium" | "low"
  created_at: string
  read: boolean
}

interface NotificationSystemProps {
  className?: string
}

export function NotificationSystem({ className }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    generateNotifications()
    const interval = setInterval(generateNotifications, 5 * 60 * 1000) // Cada 5 minutos
    return () => clearInterval(interval)
  }, [])

  const generateNotifications = async () => {
    try {
      const newNotifications: Notification[] = []

      // 1. Estudiantes con bajo rendimiento
      const { data: lowPerformers } = await supabase.rpc("get_low_performers")

      lowPerformers?.forEach((student: any, index: number) => {
        newNotifications.push({
          id: `low_perf_${index}`,
          type: "low_performance",
          title: "Bajo Rendimiento Académico",
          message: `${student.student_name} tiene un promedio de ${student.average.toFixed(1)} en ${student.course_name}`,
          student_name: student.student_name,
          course_name: student.course_name,
          priority: student.average < 4 ? "high" : "medium",
          created_at: new Date().toISOString(),
          read: false,
        })
      })

      // 2. Estudiantes sin calificaciones recientes
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: studentsWithoutGrades } = await supabase
        .from("students")
        .select(`
          id,
          full_name,
          courses!inner(name),
          grades!left(id, date)
        `)
        .is("grades.id", null)
        .limit(5)

      studentsWithoutGrades?.forEach((student: any, index: number) => {
        newNotifications.push({
          id: `no_grades_${index}`,
          type: "no_grades",
          title: "Sin Calificaciones",
          message: `${student.full_name} no tiene calificaciones registradas`,
          student_id: student.id,
          student_name: student.full_name,
          course_name: student.courses.name,
          priority: "medium",
          created_at: new Date().toISOString(),
          read: false,
        })
      })

      // 3. Estudiantes destacados
      const { data: topPerformers } = await supabase.rpc("get_student_averages")

      topPerformers?.slice(0, 2).forEach((student: any, index: number) => {
        if (student.average >= 9) {
          newNotifications.push({
            id: `high_perf_${index}`,
            type: "high_performance",
            title: "Rendimiento Excepcional",
            message: `¡${student.student_name} tiene un excelente promedio de ${student.average.toFixed(1)}!`,
            student_name: student.student_name,
            course_name: student.course_name,
            priority: "low",
            created_at: new Date().toISOString(),
            read: false,
          })
        }
      })

      setNotifications(newNotifications)
      setUnreadCount(newNotifications.filter((n) => !n.read).length)
    } catch (error) {
      console.error("Error generating notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const dismissNotification = (notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
    const notification = notifications.find((n) => n.id === notificationId)
    if (notification && !notification.read) {
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "low_performance":
        return <TrendingDown className="h-5 w-5 text-red-500" />
      case "no_grades":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "high_performance":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <Bell className="h-5 w-5 text-blue-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificaciones
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Alertas automáticas del sistema académico</CardDescription>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Marcar todas como leídas
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 border rounded-lg transition-all ${
                  notification.read
                    ? "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    : "bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800 shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4
                          className={`text-sm font-medium ${
                            notification.read ? "text-gray-600 dark:text-gray-400" : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {notification.title}
                        </h4>
                        <Badge size="sm" className={getPriorityColor(notification.priority)}>
                          {notification.priority === "high"
                            ? "Alta"
                            : notification.priority === "medium"
                              ? "Media"
                              : "Baja"}
                        </Badge>
                      </div>
                      <p
                        className={`text-sm ${
                          notification.read ? "text-gray-500 dark:text-gray-500" : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.created_at).toLocaleString("es-ES")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="h-8 w-8 p-0"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissNotification(notification.id)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay notificaciones en este momento</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
