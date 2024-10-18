import React from 'react'

type ClassAttendance = {
  class: string
  attendanceRate: number
}

type ClassAttendanceListProps = {
  data: ClassAttendance[]
}

const ClassAttendanceList: React.FC<ClassAttendanceListProps> = ({ data }) => {
  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="flex items-center justify-between">
          <span className="font-medium">{item.class}</span>
          <span className={`px-2 py-1 rounded-full text-sm ${
            item.attendanceRate >= 90 ? 'bg-green-100 text-green-800' :
            item.attendanceRate >= 80 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {item.attendanceRate}%
          </span>
        </div>
      ))}
    </div>
  )
}

export default ClassAttendanceList