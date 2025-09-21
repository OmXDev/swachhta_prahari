import { useEffect, useState } from "react"
import { FileText, Download, Eye, Calendar, Filter } from "lucide-react"
 import { toast } from "react-hot-toast";
import API_BASE_URL from "../../config";

// Mock reports data
// const reports = [
//   {
//     id: 1,
//     title: "Daily Waste Management Summary",
//     date: "2024-01-15",
//     type: "Daily Report",
//     size: "2.4 MB",
//     status: "completed",
//     description: "Comprehensive daily analysis of waste management activities",
//   },
//   {
//     id: 2,
//     title: "Weekly Incident Analysis",
//     date: "2024-01-14",
//     type: "Weekly Report",
//     size: "5.1 MB",
//     status: "completed",
//     description: "Weekly summary of incidents and resolution metrics",
//   },
//   {
//     id: 3,
//     title: "Camera Performance Report",
//     date: "2024-01-13",
//     type: "Technical Report",
//     size: "1.8 MB",
//     status: "completed",
//     description: "Analysis of camera uptime and detection accuracy",
//   },
//   {
//     id: 4,
//     title: "Monthly Compliance Report",
//     date: "2024-01-12",
//     type: "Compliance Report",
//     size: "3.7 MB",
//     status: "completed",
//     description: "Monthly compliance status and regulatory adherence",
//   },
//   {
//     id: 5,
//     title: "AI Detection Accuracy Report",
//     date: "2024-01-11",
//     type: "AI Report",
//     size: "4.2 MB",
//     status: "completed",
//     description: "Analysis of AI model performance and accuracy metrics",
//   },
//   {
//     id: 6,
//     title: "Zone-wise Activity Report",
//     date: "2024-01-10",
//     type: "Activity Report",
//     size: "2.9 MB",
//     status: "processing",
//     description: "Detailed breakdown of activities across different zones",
//   },
// ]

const reportTypes = [
  { label: "All Reports", value: "all" },
  { label: "Daily Report", value: "daily" },
  { label: "Weekly Report", value: "weekly" },
  { label: "Monthly Report", value: "monthly" },
  { label: "Custom Report", value: "custom" },
]


export default function Reports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterType, setFilterType] = useState("All Reports")
  const [dateRange, setDateRange] = useState("last-7-days")

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE_URL}/reports`)
        const data = await res.json()
        if (data.success) {
          // Normalize reports for frontend
          const mapped = data.data.reports.map((r) => ({
            id: r._id,
            title: `${r.type.toUpperCase()} Report`,
            date: r.fileInfo?.generatedAt || r.createdAt,
            type: r.type,
            size: r.fileInfo?.size
              ? `${(r.fileInfo.size / (1024 * 1024)).toFixed(2)} MB`
              : "N/A",
            status: r.fileInfo ? "completed" : "processing",
            description: `Summary report (${r.type}) from ${new Date(
              r.period.startDate
            ).toLocaleDateString()} to ${new Date(r.period.endDate).toLocaleDateString()}`,
            downloadUrl: `/api/reports/${r._id}/download`,
          }))
          setReports(mapped)
        }
      } catch (err) {
        console.error("Failed to fetch reports", err)
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [])

  const filteredReports =
    filterType === "all"
      ? reports
      : reports.filter((r) => r.type === filterType)

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
      case "processing":
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
      case "failed":
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
    }
  }

  const handleDownload = async (report) => {
    try {
      const res = await fetch(`${API_BASE_URL}/${report.downloadUrl}`, {
        method: "GET",
      })
      if (!res.ok) throw new Error("Failed to download report")

      // Convert to blob and trigger download
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = report.title + ".pdf"
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      console.error("Download error:", err)
    }
  }


  const handleView = async (report) => {
    try {
      const res = await fetch(`${API_BASE_URL}/${report.downloadUrl}`, {
        method: "GET",
      })
      if (!res.ok) throw new Error("Failed to view report")

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      window.open(url, "_blank")
    } catch (err) {
      console.error("View report error:", err)
    }
  }


const generateNewReport = async () => {
  const generatePromise = new Promise(async (resolve, reject) => {
    try {
      const res = await fetch(`${API_BASE_URL}/reports/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // include auth token if needed
        },
        body: JSON.stringify({
          type: "daily",
          format: "pdf",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        reject(data.message || "Failed to generate report");
      } else {
        resolve(data);
      }
    } catch (err) {
      reject("Network error or server is down.");
    }
  });

  toast.promise(
    generatePromise,
    {
      loading: "Generating report...",
      success: (data) => {
        return `Report "${data.reportId}" generated successfully! 🎉`;
      },
      error: (errMsg) => {
        return errMsg || "Failed to generate report. Please try again.";
      },
    },
    {
      style: { minWidth: "250px" },
      success: { duration: 5000 },
      error: { duration: 5000 },
    }
  );
};


  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Reports</h1>
          <p className="text-gray-600 dark:text-gray-400">Generated reports and analytics documents</p>
        </div>

        <button
          onClick={generateNewReport}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
        >
          <FileText className="h-4 w-4" />
          <span>Generate Report</span>
        </button>
      </div>

      {/* Filters */}
      {/* <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Report Type:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              {reportTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>

          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date Range:</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="last-7-days">Last 7 Days</option>
              <option value="last-30-days">Last 30 Days</option>
              <option value="last-90-days">Last 90 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>
      </div> */}

      {/* Reports List */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Available Reports</h2>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {reports.map((report) => (
            <div key={report.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">{report.title}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}
                    >
                      {report.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{report.description}</p>

                  <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(report.date).toLocaleDateString()}</span>
                    </div>
                    <span>Type: {report.type}</span>
                    <span>Size: {report.size}</span>
                  </div>
                </div>

                {report.status === "completed" && (
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleView(report)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                      title="View Report"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(report)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Download Report"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {reports.filter((r) => r.status === "completed").length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Completed Reports</div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {reports.filter((r) => r.status === "processing").length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Processing</div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{reports.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Reports</div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {reports.reduce((acc, r) => acc + Number.parseFloat(r.size), 0).toFixed(1)} MB
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Size</div>
        </div>
      </div>
    </div>
  )
}
