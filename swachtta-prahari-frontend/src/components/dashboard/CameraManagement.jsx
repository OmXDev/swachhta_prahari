import { useEffect, useState } from "react"
import { Camera, Plus, Upload, Activity, Settings, CheckCircle, AlertCircle, Clock } from "lucide-react"
import toast from "react-hot-toast";
import API_BASE_URL from "../../config";

// Mock camera data
// const cameras = [
//   {
//     id: "CAM-001",
//     name: "Zone A - Main Entrance",
//     zone: "Zone A",
//     status: "online",
//     detections: ["Waste Overflow", "Improper Disposal"],
//     lastActivity: "2 minutes ago",
//     health: {
//       status: "healthy",
//       lastPing: "2024-01-15 14:30:25",
//       responseTime: "45ms",
//       diskSpace: "78%",
//       cpu: "23%",
//       memory: "45%",
//       latency: "12ms",
//     },
//   },
//   {
//     id: "CAM-002",
//     name: "Zone A - Collection Point",
//     zone: "Zone A",
//     status: "online",
//     detections: ["Bin Full", "Unauthorized Access"],
//     lastActivity: "5 minutes ago",
//     health: {
//       status: "healthy",
//       lastPing: "2024-01-15 14:29:15",
//       responseTime: "52ms",
//       diskSpace: "65%",
//       cpu: "18%",
//       memory: "38%",
//       latency: "15ms",
//     },
//   },
//   {
//     id: "CAM-003",
//     name: "Zone B - Loading Bay",
//     zone: "Zone B",
//     status: "offline",
//     detections: ["Spill Detection", "Vehicle Tracking"],
//     lastActivity: "2 hours ago",
//     health: {
//       status: "offline",
//       lastPing: "2024-01-15 12:15:30",
//       responseTime: "timeout",
//       diskSpace: "unknown",
//       cpu: "unknown",
//       memory: "unknown",
//       latency: "timeout",
//     },
//   },
//   {
//     id: "CAM-004",
//     name: "Zone B - Storage Area",
//     zone: "Zone B",
//     status: "maintenance",
//     detections: ["Waste Classification", "Area Monitoring"],
//     lastActivity: "1 day ago",
//     health: {
//       status: "maintenance",
//       lastPing: "2024-01-14 16:45:10",
//       responseTime: "78ms",
//       diskSpace: "92%",
//       cpu: "5%",
//       memory: "12%",
//       latency: "8ms",
//     },
//   },
// ]


export default function CameraManagement() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedCamera, setSelectedCamera] = useState(null)
  const [showHealthCheck, setShowHealthCheck] = useState(false)
  const [healthCheckLoading, setHealthCheckLoading] = useState(false)
  const [newCamera, setNewCamera] = useState({
    name: "",
    zone: "",
    location: "",
    detections: [],
  })
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const zones = ["A", "B", "C", "D"]
  const availableDetections = [
    { label: "Waste Overflow", value: "waste_overflow" },
    { label: "Improper Disposal", value: "improper_disposal" },
    { label: "Bin Full", value: "bin_full" },
    { label: "Unauthorized Access", value: "unauthorized_access" },
    { label: "Spill Detection", value: "spill_detection" },
    { label: "Vehicle Tracking", value: "vehicle_tracking" },
    { label: "Drain Clogging", value: "drain_clogging" },
    { label: "Area Monitoring", value: "area_monitoring" },
  ];


  const fetchCameras = async () => {
  try {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("No token found. Please login again.");
    }

    const res = await fetch(`${API_BASE_URL}/cameras`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, 
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch cameras");
    }

    // Map backend → frontend
    const mapped = data.data.cameras.map((cam) => ({
      id: cam._id,
      cameraId: cam.cameraId,
      name: cam.name,
      zone: cam.location?.zone || "N/A",
      status: cam.status,
      detections: cam.aiConfig?.detectionTypes || [],
      uploadedVideos: cam.uploadedVideos || [], 
    }));

    setCameras(mapped);
  } catch (err) {
    console.error("Fetch cameras error:", err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};



  useEffect(() => {
    fetchCameras(); 
  }, []);

  if (loading) return <p>Loading cameras...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;


  const getStatusColor = (status) => {
    switch (status) {
      case "online":
        return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
      case "offline":
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
      case "maintenance":
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
    }
  }


  const handleUploadVideo = async () => {
  if (!selectedFile) {
    return alert("Please select a video first!");
  }

  try {
    setUploading(true);

    const formData = new FormData();
    formData.append("video", selectedFile);

    const cameraId = "ADGAS";  

    const res = await fetch(`${API_BASE_URL}/cameras/${cameraId}/videos`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Upload failed");
    }

    alert(`Video uploaded successfully: ${data.data.video.url}`);

    setSelectedFile(null);
    setShowUploadModal(false);
  } catch (err) {
    console.error("Upload error:", err);
    alert(err.message || "Something went wrong while uploading");
  } finally {
    setUploading(false);
  }
};

  const handleHealthCheck = async (camera) => {
    try {
      setHealthCheckLoading(true);
      setShowHealthCheck(true);
      setSelectedCamera(camera);

      const res = await fetch(`${API_BASE_URL}/cameras/${camera.id}/health`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to check camera health");

      setSelectedCamera(prev => ({
        ...prev,
        health: data.data.healthStatus,
      }));
    } catch (err) {
      console.error("Camera health check error:", err);
    } finally {
      setHealthCheckLoading(false);
    }
  };

  const handleDetectionToggle = (value) => {
    setNewCamera((prev) => {
      const detections = prev.detections.includes(value)
        ? prev.detections.filter((d) => d !== value)
        : [...prev.detections, value];
      return { ...prev, detections };
    });
  };

  const handleAddCamera = async () => {
    const addCameraPromise = new Promise(async (resolve, reject) => {
      const payload = {
        cameraId: newCamera.cameraId,
        name: newCamera.name,
        location: {
          zone: newCamera.zone,
          position: newCamera.position,
        },
        rtspUrl: newCamera.rtspUrl,
        aiConfig: {
          detectionTypes: newCamera.detections,
        },
      };

      try {
        const res = await fetch(`${API_BASE_URL}/cameras/addcamera`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          reject(data.message || "Failed to add camera");
        } else {
          resolve(data);
        }
      } catch (err) {
        reject("Network error or server is down.");
      }
    });

    toast.promise(
      addCameraPromise,
      {
        loading: 'Adding camera...',
        success: (data) => {
          setShowAddModal(false);
          setNewCamera({
            cameraId: "",
            name: "",
            zone: "",
            position: "",
            rtspUrl: "",
            detections: [],
          });
          return `Camera "${data.name}" added! 🎉`;
        },
        error: (errMsg) => {
          return errMsg || 'Failed to add camera. Please try again.';
        },
      },
      {
        style: { minWidth: '250px' },
        success: { duration: 5000 },
        error: { duration: 5000 },
      }
    );
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Camera Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage cameras and upload monitoring content</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Video</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Camera</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Camera Overview</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">No.</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Camera</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Zone</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Detections</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cameras.map((camera, index) => (
                <tr
                  key={camera.id}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="py-4 px-4 text-gray-900 dark:text-white font-medium">{index + 1}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <Camera className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{camera.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{camera.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-900 dark:text-white">{camera.zone}</td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1">
                      {(camera.detections || []).slice(0, 2).map((detection, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                          {detection}
                        </span>
                      ))}
                      {camera.detections && camera.detections.length > 2 && (
                        <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                          +{camera.detections.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(camera.status)}`}
                    >
                      {camera.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedCamera(camera)}
                        className="p-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                        title="View Details"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleHealthCheck(camera)}
                        className="p-1 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                        title="Health Check"
                      >
                        <Activity className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Camera Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Add New Camera
            </h2>

            <div className="space-y-4">
              {/* Camera ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Camera ID
                </label>
                <input
                  type="text"
                  value={newCamera.cameraId}
                  onChange={(e) =>
                    setNewCamera((prev) => ({
                      ...prev,
                      cameraId: e.target.value.toUpperCase(),
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Unique Camera ID"
                />
              </div>

              {/* Camera Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Camera Name
                </label>
                <input
                  type="text"
                  value={newCamera.name}
                  onChange={(e) =>
                    setNewCamera((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter camera name"
                />
              </div>

              {/* Zone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Zone
                </label>
                <select
                  value={newCamera.zone}
                  onChange={(e) =>
                    setNewCamera((prev) => ({ ...prev, zone: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select Zone</option>
                  {zones.map((zone) => (
                    <option key={zone} value={zone}>
                      {zone}
                    </option>
                  ))}
                </select>
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Position
                </label>
                <input
                  type="text"
                  value={newCamera.position}
                  onChange={(e) =>
                    setNewCamera((prev) => ({
                      ...prev,
                      position: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="E.g. Main Gate, Parking Area"
                />
              </div>

              {/* RTSP URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  RTSP URL
                </label>
                <input
                  type="text"
                  value={newCamera.rtspUrl}
                  onChange={(e) =>
                    setNewCamera((prev) => ({
                      ...prev,
                      rtspUrl: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter RTSP stream URL"
                />
              </div>

              {/* Detection Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Detection Types
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {availableDetections.map((detection) => (
                    <label key={detection.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newCamera.detections.includes(detection.value)}
                        onChange={() => handleDetectionToggle(detection.value)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {detection.label}
                      </span>
                    </label>
                  ))}
                </div>

              </div>
            </div>

            <div className="flex items-center space-x-3 mt-6">
              <button
                onClick={handleAddCamera}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Add Camera
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Video Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Upload Video
            </h2>

            {/* Drag & Drop Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragOver
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-300 dark:border-gray-600"
                }`}
              onClick={() => document.getElementById("videoInput").click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith("video/")) {
                  setSelectedFile(file);
                } else {
                  alert("Please upload a valid video file");
                }
              }}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Drag and drop your video file here
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                or click to browse
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  document.getElementById("videoInput").click();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Choose File
              </button>
              <input
                id="videoInput"
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) setSelectedFile(file);
                }}
              />
            </div>

            {/* Selected File Preview */}
            {selectedFile && (
              <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 text-center">
                Selected: <span className="font-medium">{selectedFile.name}</span>
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center space-x-3 mt-6">
              <button
                onClick={handleUploadVideo}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}




      {/* Camera Details Modal */}
      {selectedCamera && !showHealthCheck && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {selectedCamera.name}
        </h2>
        <button
          onClick={() => setSelectedCamera(null)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Camera Information */}
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">
            Camera Information
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">ID:</span>
              <span className="text-gray-900 dark:text-white">{selectedCamera.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Name:</span>
              <span className="text-gray-900 dark:text-white">{selectedCamera.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Zone:</span>
              <span className="text-gray-900 dark:text-white">{selectedCamera.zone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                  selectedCamera.status
                )}`}
              >
                {selectedCamera.status.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Last Activity:</span>
              <span className="text-gray-900 dark:text-white">
                {selectedCamera.lastActivity || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Detection Types */}
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">
            Detection Types
          </h3>
          <div className="space-y-2">
            {selectedCamera.detections?.length > 0 ? (
              selectedCamera.detections.map((detection, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-900 dark:text-white">{detection}</span>
                </div>
              ))
            ) : (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                No detections configured
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Uploaded Videos */}
      {selectedCamera.uploadedVideos?.length > 0 && (
        <div className="mt-6">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">
            Uploaded Videos
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {selectedCamera.uploadedVideos.map((video, idx) => (
              <div
                key={idx}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                <video
                  src={video.url}
                  controls
                  className="w-full h-40 object-cover bg-black"
                />
                <div className="p-2 text-xs text-gray-700 dark:text-gray-300 truncate">
                  {video.originalName}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => handleHealthCheck(selectedCamera)}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <Activity className="h-4 w-4" />
          <span>Check Health</span>
        </button>
      </div>
    </div>
  </div>
)}


      {/* Health Check Modal */}
      {showHealthCheck && selectedCamera && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Health Check</h2>
              <button
                onClick={() => {
                  setShowHealthCheck(false)
                  setSelectedCamera(null)
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            {healthCheckLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Running health check...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <div
                    className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full ${selectedCamera.health.status === "healthy"
                      ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                      : selectedCamera.health.status === "offline"
                        ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                        : "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300"
                      }`}
                  >
                    {selectedCamera.health.status === "healthy" && <CheckCircle className="h-4 w-4" />}
                    {selectedCamera.health.status === "offline" && <AlertCircle className="h-4 w-4" />}
                    {selectedCamera.health.status === "maintenance" && <Clock className="h-4 w-4" />}
                    <span className="font-medium capitalize">{selectedCamera.health.status}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {selectedCamera.health.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">Last Ping:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedCamera.health.lastPing}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">Response Time:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedCamera.health.responseTime}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">Disk Space:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedCamera.health.diskSpace}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">CPU Usage:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedCamera.health.cpu}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">Memory:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedCamera.health.memory}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">Latency:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedCamera.health.latency}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
