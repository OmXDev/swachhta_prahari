import { AlertTriangle, Clock, CheckCircle, Camera, Activity, Server, Wifi, Database } from "lucide-react"
import { useEffect, useState } from "react"
import jsPDF from 'jspdf'
import API_BASE_URL from "../../config";

// Mock data
const stats = [
  {
    title: "Total Incidents Today",
    value: "12",
    change: "+3 from yesterday",
    icon: AlertTriangle,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    borderColor: "border-red-200 dark:border-red-800",
  },
  {
    title: "Pending Actions",
    value: "8",
    change: "2 high priority",
    icon: Clock,
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    borderColor: "border-yellow-200 dark:border-yellow-800",
  },
  {
    title: "Resolved Today",
    value: "15",
    change: "+5 from yesterday",
    icon: CheckCircle,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    borderColor: "border-green-200 dark:border-green-800",
  },
  {
    title: "Active Cameras",
    value: "24/26",
    change: "2 offline",
    icon: Camera,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
]

// const recentIncidents = [
//   {
//     id: 1,
//     title: "Improper Waste Disposal - Zone A",
//     time: "2 minutes ago",
//     priority: "high",
//     status: "pending",
//     camera: "CAM-001",
//   },
//   {
//     id: 2,
//     title: "Overflow Detection - Bin #23",
//     time: "15 minutes ago",
//     priority: "medium",
//     status: "pending",
//     camera: "CAM-007",
//   },
//   {
//     id: 3,
//     title: "Unauthorized Dumping - Zone C",
//     time: "1 hour ago",
//     priority: "high",
//     status: "resolved",
//     camera: "CAM-012",
//   },
//   {
//     id: 4,
//     title: "Bin Collection Required - Zone B",
//     time: "2 hours ago",
//     priority: "low",
//     status: "pending",
//     camera: "CAM-005",
//   },
//   {
//     id: 5,
//     title: "Spill Detection - Loading Area",
//     time: "3 hours ago",
//     priority: "medium",
//     status: "resolved",
//     camera: "CAM-018",
//   },
// ]

const downloadIncidentPDF = (incident) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Incident Report", 14, 20);

  doc.setFontSize(12);
  doc.text(`Incident ID: ${incident.incidentId}`, 14, 30);
  doc.text(`Type: ${incident.type}`, 14, 40);
  doc.text(`Severity: ${incident.severity}`, 14, 50);
  doc.text(`Status: ${incident.status}`, 14, 60);
  doc.text(`Description: ${incident.description}`, 14, 70);
  doc.text(`Camera: ${incident.camera?.cameraId} (${incident.camera?.name})`, 14, 80);
  doc.text(`Zone: ${incident.location?.zone}`, 14, 90);
  doc.text(`Coordinates: ${incident.location?.coordinates?.x}, ${incident.location?.coordinates?.y}`, 14, 100);
  doc.text(`Confidence: ${Math.round(incident.aiDetection?.confidence * 100)}%`, 14, 110);
  doc.text(`Model Version: ${incident.aiDetection?.modelVersion}`, 14, 120);
  doc.text(`Created At: ${new Date(incident.createdAt).toLocaleString()}`, 14, 130);

  doc.save(`incident_${incident.incidentId}.pdf`);
};

const systemStatus = [
  {
    name: "Active Cameras",
    value: "24/26",
    status: "online",
    icon: Camera,
  },
  {
    name: "AI Processing Engine",
    value: "Online",
    status: "online",
    icon: Activity,
  },
  {
    name: "Database Connection",
    value: "Connected",
    status: "online",
    icon: Database,
  },
  {
    name: "Network Status",
    value: "Stable",
    status: "online",
    icon: Wifi,
  },
  {
    name: "Server Health",
    value: "98% Uptime",
    status: "online",
    icon: Server,
  },
]

const getPriorityColor = (priority) => {
  switch (priority) {
    case "high":
      return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800"
    case "medium":
      return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
    case "low":
      return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800"
    default:
      return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600"
  }
}

const getStatusColor = (status) => {
  switch (status) {
    case "pending":
      return "bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800"
    case "resolved":
      return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800"
    default:
      return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600"
  }
}

export default function DashboardContent() {
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
const [showReport, setShowReport] = useState(false);

useEffect(() => {
  const fetchIncidents = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/incidents?limit=5&sortBy=createdAt&sortOrder=desc`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch incidents");

      // Map API → frontend props
      const mapped = data.data.incidents.map((inc) => ({
        id: inc._id,
        title: `${inc.type} - ${inc.location?.zone || "Unknown Zone"}`,
        time: new Date(inc.createdAt).toLocaleString(),
        priority: inc.severity,
        status: inc.status,
        camera: inc.camera?.cameraId || "N/A",
      }));

      setRecentIncidents(mapped);
    } catch (err) {
      console.error("Fetch incidents error:", err);
    }
  };

  fetchIncidents();
}, []);

const fetchIncidentDetails = async (id) => {
  try {
    const res = await fetch(`${API_BASE_URL}/incidents/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch incident");

    setSelectedIncident(data.data.incident);
    setShowReport(true);
  } catch (err) {
    console.error("Fetch incident by ID error:", err);
  }
};


  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor waste management activities across Sahibabad Industrial Site
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className={`${stat.bgColor} ${stat.borderColor} border rounded-xl p-6 transition-all hover:shadow-md`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Incidents */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Incidents</h2>
            <button className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium">
              View All
            </button>
          </div>

          <div className="space-y-4">
            {recentIncidents.map((incident) => (
              <div
                key={incident.id}
                onClick={() => fetchIncidentDetails(incident.id)}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm">{incident.title}</h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{incident.time}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(incident.priority)}`}
                    >
                      {incident.priority.toUpperCase()}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(incident.status)}`}
                    >
                      {incident.status.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{incident.camera}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">System Status</h2>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">All Systems Online</span>
            </div>
          </div>

          <div className="space-y-4">
            {systemStatus.map((system, index) => {
              const Icon = system.icon
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <Icon className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white text-sm">{system.name}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{system.value}</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-3 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="text-sm font-medium text-gray-900 dark:text-white">System Health</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Check all systems</div>
              </button>
              <button className="p-3 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="text-sm font-medium text-gray-900 dark:text-white">Generate Report</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Daily summary</div>
              </button>
            </div>
          </div>
        </div>
      </div>
      {showReport && selectedIncident && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full p-6 relative">
      <button
        onClick={() => setShowReport(false)}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>

      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Incident Report - {selectedIncident.incidentId}
      </h2>

      <div className="space-y-3 text-gray-700 dark:text-gray-300">
        <p><strong>Type:</strong> {selectedIncident.type}</p>
        <p><strong>Severity:</strong> {selectedIncident.severity}</p>
        <p><strong>Status:</strong> {selectedIncident.status}</p>
        <p><strong>Description:</strong> {selectedIncident.description}</p>
        <p><strong>Camera:</strong> {selectedIncident.camera?.cameraId} ({selectedIncident.camera?.name})</p>
        <p><strong>Zone:</strong> {selectedIncident.location?.zone}</p>
        <p><strong>Specific:</strong> {selectedIncident.location?.specific}</p>
        <p><strong>Coordinates:</strong> 
          {selectedIncident.location?.coordinates?.x}, 
          {selectedIncident.location?.coordinates?.y}
        </p>
        <p><strong>Confidence:</strong> {Math.round(selectedIncident.aiDetection?.confidence * 100)}%</p>
        <p><strong>Model Version:</strong> {selectedIncident.aiDetection?.modelVersion}</p>
        <p><strong>Created At:</strong> {new Date(selectedIncident.createdAt).toLocaleString()}</p>
      </div>

      <button
        onClick={() => downloadIncidentPDF(selectedIncident)}
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
      >
        Download Report
      </button>
    </div>
  </div>
)}

    </div>
  )
}
