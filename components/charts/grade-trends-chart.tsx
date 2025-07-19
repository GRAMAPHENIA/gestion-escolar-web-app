"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { TrendingUp, Download, Calendar } from "lucide-react"
import { supabase } from "@/lib/supabase-updated"
import { format, subMonths, startOfMonth } from "date-fns"
import { es } from "date-fns/locale"

interface TrendData {
  month: string
  promedio: number
  totalNotas: number
  monthYear: string
}

interface GradeTrendsChartProps {
  className?: string
}

export function GradeTrendsChart({ className }: GradeTrendsChartProps) {
  const [data, setData] = useState<TrendData[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("6") // 6 meses por defecto

  useEffect(() => {
    loadTrendData()
  }, [period])

  const loadTrendData = async () => {
    setLoading(true)
    try {
      const monthsBack = Number.parseInt(period)
      const startDate = startOfMonth(subMonths(new Date(), monthsBack - 1))

      const { data: gradesData, error } = await supabase
        .from("grades")
        .select("grade, date")
        .gte("date", startDate.toISOString().split("T")[0])
        .not("grade", "is", null)
        .order("date")

      if (error) throw error

      // Agrupar por mes
      const monthlyData = new Map<string, { grades: number[]; count: number }>()

      gradesData?.forEach((grade) => {
        const monthKey = format(new Date(grade.date), "yyyy-MM")
        const monthLabel = format(new Date(grade.date), "MMM yyyy", { locale: es })

        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, { grades: [], count: 0 })
        }

        const monthData = monthlyData.get(monthKey)!
        monthData.grades.push(grade.grade)
        monthData.count++
      })

      // Convertir a formato para el gráfico
      const chartData: TrendData[] = Array.from(monthlyData.entries())
        .map(([monthKey, data]) => ({
          month: format(new Date(monthKey + "-01"), "MMM yyyy", { locale: es }),
          promedio: Number((data.grades.reduce((sum, grade) => sum + grade, 0) / data.grades.length).toFixed(2)),
          totalNotas: data.count,
          monthYear: monthKey,
        }))
        .sort((a, b) => a.monthYear.localeCompare(b.monthYear))

      setData(chartData)
    } catch (error) {
      console.error("Error loading trend data:", error || "Unknown error")
      setData([])
    } finally {
      setLoading(false)
    }
  }

  const exportChart = () => {
    // Implementar exportación
    console.log("Exportando gráfico...")
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          <p className="text-blue-600 dark:text-blue-400">
            Promedio: <span className="font-semibold">{payload[0].value}</span>
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{payload[0].payload.totalNotas} calificaciones</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tendencia de Calificaciones
            </CardTitle>
            <CardDescription>Evolución del promedio de notas a lo largo del tiempo</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 meses</SelectItem>
                <SelectItem value="6">6 meses</SelectItem>
                <SelectItem value="12">12 meses</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={exportChart}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-gray-500">Cargando datos...</div>
          </div>
        ) : data.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} className="text-gray-600 dark:text-gray-400" />
                <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} className="text-gray-600 dark:text-gray-400" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="promedio"
                  stroke="#F6A03B"
                  strokeWidth={3}
                  dot={{ fill: "#F6A03B", strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: "#F6A03B", strokeWidth: 2 }}
                  name="Promedio General"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex flex-col items-center justify-center text-gray-500">
            <Calendar className="h-12 w-12 mb-4 opacity-50" />
            <p>No hay datos suficientes para mostrar tendencias</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
