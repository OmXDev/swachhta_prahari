import React from 'react'
import Card from '../common/Card'
export default function StatCard({ title, value, change, icon: Icon, color='blue' }) {
  const colors = { blue:'text-blue-600 bg-blue-100', green:'text-green-600 bg-green-100', red:'text-red-600 bg-red-100', yellow:'text-yellow-600 bg-yellow-100' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change!==undefined && <p className={`text-sm mt-2 ${change>0?'text-green-600':'text-red-600'}`}>{change>0?'+':''}{change}% from yesterday</p>}
        </div>
        <div className={`p-3 rounded-full ${colors[color]}`}><span className="w-6 h-6 inline-block" /></div>
      </div>
    </Card>
  )
}
