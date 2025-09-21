import React from 'react'
import Badge from '../common/Badge'
import Card from '../common/Card'
export default function IncidentCard({ incident, onViewDetails }) {
  const severityColors = { high:'error', medium:'warning', low:'info' }
  const statusColors = { pending:'warning', in_progress:'info', resolved:'success' }
  return (
    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={()=>onViewDetails(incident)}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="text-red-500 mt-1">!</div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">{incident.description}</h4>
            <p className="text-sm text-gray-600 mt-1">{incident.location} ({incident.camera})</p>
            <p className="text-xs text-gray-500 mt-1">{new Date(incident.timestamp).toLocaleString()}</p>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <Badge variant={severityColors[incident.severity]}>{incident.severity.toUpperCase()}</Badge>
          <Badge variant={statusColors[incident.status]} size="sm">{incident.status.replace('_',' ').toUpperCase()}</Badge>
        </div>
      </div>
    </Card>
  )
}
