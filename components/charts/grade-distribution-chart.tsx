"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { PieChartIcon, Download } from "lucide-react"
import { supabase } from "@/lib/supabase-updated"

interface GradeDistribution {
  rango: string
  cantidad: number
  porcentaje: number
  color: string
}

interface GradeDistributionChartProps {
  className?: string
}

export function GradeDistributionChart({ className }: GradeDistributionChartProps) {
  const [data, setData] = useState<GradeDistribution[]>([])
  const [loading, setLoading] = useState(true)
  const [totalGrades, setTotalGrades] = useState(0)

  useEffect(() => {
    loadGradeDistribution()
  }, [])

  const loadGradeDistribution = async () => {
    try {
      const { data: grades, error } = await supabase.from("grades").select("grade").not("grade", "is", null)

      if (error) throw error

      const total = grades?.length || 0
      setTotalGrades(total)

      if (total === 0) {
        setData([])
        return
      }

      // Categorizar las notas
      const distribution = {
        excelente: grades?.filter((g) => g.grade >= 9).length || 0,
        muyBueno: grades?.filter((g) => g.grade >= 8 && g.grade < 9).length || 0,
        bueno: grades?.filter((g) => g.grade >= 7 && g.grade < 8).length || 0,
        regular: grades?.filter((g) => g.grade >= 6 && g.grade < 7).length || 0,
        insuficiente: grades?.filter((g) => g.grade < 6).length || 0,
      }

      const chartData: GradeDistribution[] = [
        {
          rango: "Excelente (9-10)",
          cantidad: distribution.excelente,
          porcentaje: Number(((distribution.excelente / total) * 100).toFixed(1)),
          color: "#10B981",
        },
        {
          rango: "Muy Bueno (8-9)",
          cantidad: distribution.muyBueno,
          porcentaje: Number(((distribution.muyBueno / total) * 100).toFixed(1)),
          color: "#34D399",
        },
        {
          rango: "Bueno (7-8)",
          cantidad: distribution.bueno,
          porcentaje: Number(((distribution.bueno / total) * 100).toFixed(1)),
          color: "#F59E0B",
        },
        {
          rango: "Regular (6-7)",
          cantidad: distribution.regular,
          porcentaje: Number(((distribution.regular / total) * 100).toFixed(1)),
          color: "#F97316",
        },
        {
          rango: "Insuficiente (<6)",
          cantidad: distribution.insuficiente,
          porcentaje: Number(((distribution.insuficiente / total) * 100).toFixed(1)),
          color: "#EF4444",
        },
      ].filter((item) => item.cantidad > 0) // Solo mostrar categorías con datos

      setData(chartData)
    } catch (error) {
      console.error("Error loading grade distribution:", error || "Unknown error")
      setData([])
    } finally {
      setLoading(false)
    }
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{data.rango}</p>
          <p className="text-blue-600 dark:text-blue-400">
            Cantidad: <span className="font-semibold">{data.cantidad}</span>
          </p>
          <p className="text-green-600 dark:text-green-400">
            Porcentaje: <span className="font-semibold">{data.porcentaje}%</span>
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null // No mostrar etiquetas para segmentos muy pequeños

    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  const exportChart = () => {
    console.log("Exportando gráfico de distribución...")
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Distribución de Calificaciones
            </CardTitle>
            <CardDescription>
              Distribución porcentual de las calificaciones ({totalGrades} notas totales)
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={exportChart}>
            <Download className="h-4 w-4" />
          </Button>
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
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={CustomLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="cantidad"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value, entry: any) => (
                    <span style={{ color: entry.color }}>
                      {value} ({entry.payload.cantidad})
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex flex-col items-center justify-center text-gray-500">
            <PieChartIcon className="h-12 w-12 mb-4 opacity-50" />
            <p>No hay calificaciones para mostrar la distribución</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
