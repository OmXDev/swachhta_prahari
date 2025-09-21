"use client"

import { useState } from "react"
import {
  TrendingUp,
  Clock,
  AlertTriangle,
  Activity,
  BarChart3,
  LineChart,
  PieChart,
  Calendar,
} from "lucide-react"
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart as ReBarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts"

// Mock analytics data
const analyticsStats = [
  {
    title: "Detection Accuracy",
    value: "94.2%",
    change: "+2.1% from last week",
    trend: "up",
    icon: TrendingUp,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    borderColor: "border-green-200 dark:border-green-800",
  },
  {
    title: "Response Time",
    value: "2.3s",
    change: "-0.5s from last week",
    trend: "up",
    icon: Clock,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  {
    title: "False Positives",
    value: "5.8%",
    change: "-1.2% from last week",
    trend: "up",
    icon: AlertTriangle,
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    borderColor: "border-yellow-200 dark:border-yellow-800",
  },
  {
    title: "System Uptime",
    value: "99.7%",
    change: "+0.1% from last week",
    trend: "up",
    icon: Activity,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    borderColor: "border-purple-200 dark:border-purple-800",
  },
]

// Mock chart data
const detectionAccuracyData = [
  { day: "Mon", accuracy: 92.1 },
  { day: "Tue", accuracy: 93.5 },
  { day: "Wed", accuracy: 91.8 },
  { day: "Thu", accuracy: 94.2 },
  { day: "Fri", accuracy: 95.1 },
  { day: "Sat", accuracy: 93.7 },
  { day: "Sun", accuracy: 94.2 },
]

const responseTimeData = [
  { hour: "00:00", time: 2.1 },
  { hour: "04:00", time: 1.9 },
  { hour: "08:00", time: 2.8 },
  { hour: "12:00", time: 3.2 },
  { hour: "16:00", time: 2.9 },
  { hour: "20:00", time: 2.3 },
]

const incidentTypeData = [
  { type: "Improper Disposal", count: 45, percentage: 35 },
  { type: "Overflow", count: 32, percentage: 25 },
  { type: "Unauthorized Dumping", count: 28, percentage: 22 },
  { type: "Spills", count: 23, percentage: 18 },
]

const zoneActivityData = [
  { zone: "Zone A", incidents: 28, resolved: 25, pending: 3 },
  { zone: "Zone B", incidents: 35, resolved: 30, pending: 5 },
  { zone: "Zone C", incidents: 22, resolved: 20, pending: 2 },
]

const COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#22c55e"]

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("7-days")

  const timeRanges = [
    { value: "24-hours", label: "Last 24 Hours" },
    { value: "7-days", label: "Last 7 Days" },
    { value: "30-days", label: "Last 30 Days" },
    { value: "90-days", label: "Last 90 Days" },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Performance metrics and system analytics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-gray-400" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className={`${stat.bgColor} ${stat.borderColor} border rounded-xl p-6 transition-all hover:shadow-md cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div
                  className={`text-xs px-2 py-1 rounded-full ${stat.color} ${stat.bgColor} border ${stat.borderColor}`}
                >
                  {stat.trend === "up" ? "↗" : "↘"}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
                <p className={`text-xs ${stat.color}`}>{stat.change}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Detection Accuracy Chart */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Detection Accuracy Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <ReLineChart data={detectionAccuracyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="accuracy" stroke="#22c55e" strokeWidth={2} />
            </ReLineChart>
          </ResponsiveContainer>
        </div>

        {/* Response Time Chart */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Average Response Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <ReLineChart data={responseTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="time" stroke="#3b82f6" strokeWidth={2} />
            </ReLineChart>
          </ResponsiveContainer>
        </div>

        {/* Incident Types Pie */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Incident Types Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RePieChart>
              <Pie
                data={incidentTypeData}
                dataKey="count"
                nameKey="type"
                outerRadius={100}
                label
              >
                {incidentTypeData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RePieChart>
          </ResponsiveContainer>
        </div>

        {/* Zone Activity Bar */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Zone Activity Comparison</h3>
          <ResponsiveContainer width="100%" height={250}>
            <ReBarChart data={zoneActivityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="zone" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="incidents" fill="#ef4444" />
              <Bar dataKey="resolved" fill="#22c55e" />
              <Bar dataKey="pending" fill="#f59e0b" />
            </ReBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">↗ 12%</div>
            <div className="text-sm text-green-800 dark:text-green-200 font-medium">Detection Improvement</div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">vs last month</div>
          </div>

          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">↘ 0.8s</div>
            <div className="text-sm text-blue-800 dark:text-blue-200 font-medium">Faster Response</div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">vs last month</div>
          </div>

          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">99.7%</div>
            <div className="text-sm text-purple-800 dark:text-purple-200 font-medium">System Reliability</div>
            <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">this month</div>
          </div>
        </div>
      </div>
    </div>
  )
}
