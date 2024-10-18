'use client'

import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28']

type AttendanceData = {
  present: number
  absent: number
  late: number
}

type AttendanceDonutChartProps = {
  data: AttendanceData
}

const AttendanceDonutChart: React.FC<AttendanceDonutChartProps> = ({ data }) => {
  const chartData = [
    { name: 'Present', value: data.present },
    { name: 'Absent', value: data.absent },
    { name: 'Late', value: data.late },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
//components/Dashboard/AttendanceDonutChart.tsx
export default AttendanceDonutChart