import React from 'react'
import { UserCheck, UserX, Clock } from 'lucide-react'

export type Activity = {
  type: 'check-in' | 'absent' | 'late'
  name: string
  time: string
  class?: string
}

type RecentActivityFeedProps = {
  activities: Activity[]
}

const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ activities }) => {
  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-center space-x-4">
          {activity.type === 'check-in' && <UserCheck className="h-5 w-5 text-green-500" />}
          {activity.type === 'absent' && <UserX className="h-5 w-5 text-red-500" />}
          {activity.type === 'late' && <Clock className="h-5 w-5 text-yellow-500" />}
          <div>
            <p className="text-sm font-medium">{activity.name}</p>
            <p className="text-xs text-muted-foreground">
              {activity.type === 'check-in' && 'Checked in'}
              {activity.type === 'absent' && 'Marked absent'}
              {activity.type === 'late' && 'Arrived late'}
              {' at '}{activity.time}
              {activity.class && ` for ${activity.class}`}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default RecentActivityFeed