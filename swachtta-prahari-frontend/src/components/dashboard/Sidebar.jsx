"use client"

import { Link, NavLink } from "react-router-dom"
import { LayoutDashboard, Monitor, FileText, BarChart3, Camera, Settings, Leaf, DollarSign, User, Users } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"

const roleBasedNav = {
  admin: ["", "monitoring", "reports", "analytics", "cameras", "payout", "settings", "manager"],
  camera: ["", "cameras", "settings"],
  payroll: ["", "payout", "settings"],
  manager: ["", "reports", "analytics", "settings"], 
  user: ["", "settings"], 
}

const navigationItems = [
  { id: "", label: "Dashboard", icon: LayoutDashboard, to: "/" },
  { id: "monitoring", label: "Live Monitoring", icon: Monitor, to: "/monitoring" },
  { id: "reports", label: "Reports", icon: FileText, to: "/reports" },
  { id: "analytics", label: "Analytics", icon: BarChart3, to: "/analytics" },
  { id: "cameras", label: "Camera Management", icon: Camera, to: "/cameras" },
  { id: "payout", label: "Payout", icon: DollarSign, to: "/payout" },
  { id: "manager", label: "Manager Management", icon: Users, to: "/manager" },
  { id: "settings", label: "Settings", icon: Settings, to: "/settings" },
]

export default function Sidebar() {
  const { user } = useAuth()
  const allowedIds = roleBasedNav[user?.role] || roleBasedNav["user"] // fallback

  const filteredItems = navigationItems.filter((item) => allowedIds.includes(item.id))

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      
      <Link to="/" className="block">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer">
          <div className="flex items-center space-x-3">
            <div className="bg-green-600 p-2 rounded-lg">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">UPSIDA Portal</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">AI Monitoring System</p>
            </div>
          </div>
        </div>
      </Link>

      
      <nav className="flex-1 p-4 space-y-2">
        {filteredItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.id}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  isActive
                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-700 dark:text-green-300">System Online</span>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400">All systems operational</p>
        </div>
      </div>
    </div>
  )
}
