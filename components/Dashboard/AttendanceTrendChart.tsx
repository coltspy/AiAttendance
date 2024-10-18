'use client'

import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

type AttendanceData = {
  date: string
  present: number
  absent: number
  late: number
}

type AttendanceTrendChartProps = {
  data: AttendanceData[]
}

const AttendanceTrendChart: React.FC<AttendanceTrendChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="present" stroke="#8884d8" activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="absent" stroke="#82ca9d" />
        <Line type="monotone" dataKey="late" stroke="#ffc658" />
      </LineChart>
    </ResponsiveContainer>
  )
}
//components//Dashboard/AttendanceTrendChart.tsx
export default AttendanceTrendChart