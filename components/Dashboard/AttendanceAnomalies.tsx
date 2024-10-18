import React from 'react'
import { AlertTriangle } from 'lucide-react'

const anomalies = [
  { department: 'Sales', issue: 'Unusually high absence rate', percentage: '15%' },
  { department: 'IT', issue: 'Increased late arrivals', percentage: '10%' },
  { department: 'HR', issue: 'Early departures spike', percentage: '8%' },
]

export default function AttendanceAnomalies() {
  return (
    <div className="space-y-4">
      {anomalies.map((anomaly, index) => (
        <div key={index} className="flex items-center space-x-4 bg-yellow-100 p-4 rounded-md">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <div>
            <p className="font-medium">{anomaly.department}</p>
            <p className="text-sm text-gray-600">{anomaly.issue}</p>
            <p className="text-xs text-gray-500">Affected: {anomaly.percentage}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

//components/Dashboard/AttendanceAnomalies.tsx