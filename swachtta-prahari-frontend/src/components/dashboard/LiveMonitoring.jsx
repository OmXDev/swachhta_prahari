import { useState } from "react"
import { Camera, Wifi, WifiOff, Play, Maximize2, MapPin, Minimize2 } from "lucide-react"

// Mock camera data
const cameras = [
  {
    id: "CAM-001",
    name: "Zone A - Main Entrance",
    zone: "Zone A",
    status: "online",
    location: "Main Entrance Gate",
    lastActivity: "2 minutes ago",
    detections: 15,
  },
  {
    id: "CAM-002",
    name: "Zone A - Waste Collection",
    zone: "Zone A",
    status: "online",
    location: "Collection Point 1",
    lastActivity: "5 minutes ago",
    detections: 8,
  },
  {
    id: "CAM-003",
    name: "Zone B - Loading Bay",
    zone: "Zone B",
    status: "offline",
    location: "Loading Bay 1",
    lastActivity: "2 hours ago",
    detections: 0,
  },
  {
    id: "CAM-004",
    name: "Zone B - Storage Area",
    zone: "Zone B",
    status: "online",
    location: "Storage Facility",
    lastActivity: "1 minute ago",
    detections: 23,
  },
  {
    id: "CAM-005",
    name: "Zone C - Processing Unit",
    zone: "Zone C",
    status: "online",
    location: "Processing Center",
    lastActivity: "30 seconds ago",
    detections: 31,
  },
  {
    id: "CAM-006",
    name: "Zone C - Exit Point",
    zone: "Zone C",
    status: "maintenance",
    location: "Exit Gate",
    lastActivity: "1 day ago",
    detections: 0,
  },
]

export default function LiveMonitoring() {
  const [selectedCamera, setSelectedCamera] = useState(null)
  const [filterZone, setFilterZone] = useState("all")
  const [isEnlarged, setIsEnlarged] = useState(false);


  const zones = ["all", "Zone A", "Zone B", "Zone C"]

  const filteredCameras = filterZone === "all" ? cameras : cameras.filter((camera) => camera.zone === filterZone)

  const getStatusColor = (status) => {
    switch (status) {
      case "online":
        return "text-green-600 dark:text-green-400"
      case "offline":
        return "text-red-600 dark:text-red-400"
      case "maintenance":
        return "text-yellow-600 dark:text-yellow-400"
      default:
        return "text-gray-600 dark:text-gray-400"
    }
  }

  const getStatusBg = (status) => {
    switch (status) {
      case "online":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
      case "offline":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
      case "maintenance":
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
      default:
        return "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
    }
  }

  const openLiveFeed = (camera) => {
    setSelectedCamera(camera)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Live Monitoring</h1>
          <p className="text-gray-600 dark:text-gray-400">Real-time camera feeds and monitoring status</p>
        </div>

        {/* Zone Filter */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Zone:</label>
          <select
            value={filterZone}
            onChange={(e) => setFilterZone(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {zones.map((zone) => (
              <option key={zone} value={zone}>
                {zone === "all" ? "All Zones" : zone}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Wifi className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="font-medium text-green-800 dark:text-green-200">Online</span>
          </div>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">
            {cameras.filter((c) => c.status === "online").length}
          </p>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <WifiOff className="h-5 w-5 text-red-600 dark:text-red-400" />
            <span className="font-medium text-red-800 dark:text-red-200">Offline</span>
          </div>
          <p className="text-2xl font-bold text-red-900 dark:text-red-100">
            {cameras.filter((c) => c.status === "offline").length}
          </p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Camera className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <span className="font-medium text-yellow-800 dark:text-yellow-200">Maintenance</span>
          </div>
          <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
            {cameras.filter((c) => c.status === "maintenance").length}
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Camera className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="font-medium text-blue-800 dark:text-blue-200">Total Cameras</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{cameras.length}</p>
        </div>
      </div>

      {/* Camera Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCameras.map((camera) => (
          <div
            key={camera.id}
            className={`border rounded-xl p-6 transition-all hover:shadow-md ${getStatusBg(camera.status)}`}
          >
            {/* Camera Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{camera.name}</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="h-4 w-4" />
                  <span>{camera.location}</span>
                </div>
              </div>
              <div className={`flex items-center space-x-1 ${getStatusColor(camera.status)}`}>
                {camera.status === "online" ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                <span className="text-sm font-medium capitalize">{camera.status}</span>
              </div>
            </div>

            {/* Camera Preview */}
            <div className="bg-gray-900 rounded-lg aspect-video mb-4 flex items-center justify-center relative overflow-hidden">
              {camera.status === "online" ? (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900"></div>
                  <div className="relative z-10 text-center">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-300 text-sm">Live Feed Available</p>
                  </div>
                  <button
                    onClick={() => openLiveFeed(camera)}
                    className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <Play className="h-8 w-8 text-white" />
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <Camera className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Camera {camera.status}</p>
                </div>
              )}
            </div>

            {/* Camera Info */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Camera ID:</span>
                <span className="font-medium text-gray-900 dark:text-white">{camera.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Zone:</span>
                <span className="font-medium text-gray-900 dark:text-white">{camera.zone}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Detections Today:</span>
                <span className="font-medium text-gray-900 dark:text-white">{camera.detections}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Last Activity:</span>
                <span className="font-medium text-gray-900 dark:text-white">{camera.lastActivity}</span>
              </div>
            </div>

            {/* Actions */}
            {camera.status === "online" && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => openLiveFeed(camera)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Play className="h-4 w-4" />
                  <span>View Live Feed</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Live Feed Modal */}
      {selectedCamera && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className={`bg-white dark:bg-gray-800 rounded-xl overflow-hidden transition-all duration-300
        ${isEnlarged
                ? "w-full h-full max-w-screen max-h-screen"
                : "max-w-4xl w-full max-h-[90vh]"
              }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedCamera.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedCamera.location}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsEnlarged(!isEnlarged)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  {isEnlarged ? (
                    <Minimize2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <Maximize2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setSelectedCamera(null)
                    setIsEnlarged(false) // reset enlargement on close
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Live Feed */}
            <div className="p-6 h-[calc(100%-96px)] flex flex-col">
              <div className="bg-gray-900 rounded-lg aspect-video flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-pulse mb-4">
                    <Camera className="h-16 w-16 text-gray-400 mx-auto" />
                  </div>
                  <p className="text-gray-300 text-lg font-medium">
                    Live Feed - {selectedCamera.id}
                  </p>
                  <p className="text-gray-400 text-sm mt-2">Streaming in real-time</p>
                </div>
              </div>

              {/* Feed Controls */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      LIVE
                    </span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Resolution: 1920x1080 | FPS: 30
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}



    </div>
  )
}
