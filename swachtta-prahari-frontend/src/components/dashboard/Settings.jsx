import { useState } from "react"
import { SettingsIcon, Bell, Brain, Server, Save, RefreshCw } from "lucide-react"

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general")
  const [settings, setSettings] = useState({
    general: {
      siteName: "Sahibabad Industrial Site",
      timezone: "Asia/Kolkata",
      language: "English",
      dateFormat: "DD/MM/YYYY",
      autoRefresh: true,
      refreshInterval: 30,
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      incidentAlerts: true,
      systemAlerts: true,
      maintenanceAlerts: false,
      emailAddress: "admin@sahibabad.com",
      phoneNumber: "+91 9876543210",
    },
    aiDetection: {
      detectionSensitivity: "medium",
      confidenceThreshold: 85,
      enableRealTimeDetection: true,
      enableBatchProcessing: false,
      autoLearnFromFeedback: true,
      falsePositiveReduction: true,
      detectionTypes: {
        wasteOverflow: true,
        improperDisposal: true,
        unauthorizedAccess: true,
        spillDetection: true,
        binFull: true,
        vehicleTracking: false,
      },
    },
    system: {
      maxConcurrentStreams: 10,
      videoRetentionDays: 30,
      logRetentionDays: 90,
      enableSystemLogs: true,
      enablePerformanceLogs: true,
      enableSecurityLogs: true,
      backupFrequency: "daily",
      maintenanceMode: false,
    },
  })

  const tabs = [
    { id: "general", label: "General", icon: SettingsIcon },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "aiDetection", label: "AI Detection", icon: Brain },
    { id: "system", label: "System", icon: Server },
  ]

  const handleSettingChange = (category, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }))
  }

  const handleNestedSettingChange = (category, parentKey, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [parentKey]: {
          ...prev[category][parentKey],
          [key]: value,
        },
      },
    }))
  }

  const handleSaveSettings = () => {
    // Mock save functionality
    console.log("Saving settings:", settings)
    // Show success message
  }

  const handleResetSettings = () => {
    // Mock reset functionality
    console.log("Resetting settings to defaults")
  }

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Site Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Site Name</label>
            <input
              type="text"
              value={settings.general.siteName}
              onChange={(e) => handleSettingChange("general", "siteName", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Timezone</label>
            <select
              value={settings.general.timezone}
              onChange={(e) => handleSettingChange("general", "timezone", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Language</label>
            <select
              value={settings.general.language}
              onChange={(e) => handleSettingChange("general", "language", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date Format</label>
            <select
              value={settings.general.dateFormat}
              onChange={(e) => handleSettingChange("general", "dateFormat", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Display Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Auto Refresh</label>
              <p className="text-sm text-gray-600 dark:text-gray-400">Automatically refresh dashboard data</p>
            </div>
            <input
              type="checkbox"
              checked={settings.general.autoRefresh}
              onChange={(e) => handleSettingChange("general", "autoRefresh", e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
          </div>

          {settings.general.autoRefresh && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Refresh Interval (seconds)
              </label>
              <input
                type="number"
                min="10"
                max="300"
                value={settings.general.refreshInterval}
                onChange={(e) => handleSettingChange("general", "refreshInterval", Number.parseInt(e.target.value))}
                className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notification Channels</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</label>
              <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications via email</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.emailNotifications}
              onChange={(e) => handleSettingChange("notifications", "emailNotifications", e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">SMS Notifications</label>
              <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications via SMS</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.smsNotifications}
              onChange={(e) => handleSettingChange("notifications", "smsNotifications", e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Push Notifications</label>
              <p className="text-sm text-gray-600 dark:text-gray-400">Receive browser push notifications</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.pushNotifications}
              onChange={(e) => handleSettingChange("notifications", "pushNotifications", e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Alert Types</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Incident Alerts</label>
              <p className="text-sm text-gray-600 dark:text-gray-400">Alerts for waste management incidents</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.incidentAlerts}
              onChange={(e) => handleSettingChange("notifications", "incidentAlerts", e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">System Alerts</label>
              <p className="text-sm text-gray-600 dark:text-gray-400">Alerts for system status changes</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.systemAlerts}
              onChange={(e) => handleSettingChange("notifications", "systemAlerts", e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Maintenance Alerts</label>
              <p className="text-sm text-gray-600 dark:text-gray-400">Alerts for scheduled maintenance</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.maintenanceAlerts}
              onChange={(e) => handleSettingChange("notifications", "maintenanceAlerts", e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
            <input
              type="email"
              value={settings.notifications.emailAddress}
              onChange={(e) => handleSettingChange("notifications", "emailAddress", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
            <input
              type="tel"
              value={settings.notifications.phoneNumber}
              onChange={(e) => handleSettingChange("notifications", "phoneNumber", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderAIDetectionSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Detection Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Detection Sensitivity
            </label>
            <select
              value={settings.aiDetection.detectionSensitivity}
              onChange={(e) => handleSettingChange("aiDetection", "detectionSensitivity", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confidence Threshold (%)
            </label>
            <input
              type="number"
              min="50"
              max="99"
              value={settings.aiDetection.confidenceThreshold}
              onChange={(e) =>
                handleSettingChange("aiDetection", "confidenceThreshold", Number.parseInt(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Processing Options</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Real-time Detection</label>
              <p className="text-sm text-gray-600 dark:text-gray-400">Process video feeds in real-time</p>
            </div>
            <input
              type="checkbox"
              checked={settings.aiDetection.enableRealTimeDetection}
              onChange={(e) => handleSettingChange("aiDetection", "enableRealTimeDetection", e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Batch Processing</label>
              <p className="text-sm text-gray-600 dark:text-gray-400">Process recorded videos in batches</p>
            </div>
            <input
              type="checkbox"
              checked={settings.aiDetection.enableBatchProcessing}
              onChange={(e) => handleSettingChange("aiDetection", "enableBatchProcessing", e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Auto-learn from Feedback</label>
              <p className="text-sm text-gray-600 dark:text-gray-400">Improve accuracy using user feedback</p>
            </div>
            <input
              type="checkbox"
              checked={settings.aiDetection.autoLearnFromFeedback}
              onChange={(e) => handleSettingChange("aiDetection", "autoLearnFromFeedback", e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">False Positive Reduction</label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enable advanced filtering to reduce false positives
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.aiDetection.falsePositiveReduction}
              onChange={(e) => handleSettingChange("aiDetection", "falsePositiveReduction", e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Detection Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(settings.aiDetection.detectionTypes).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </label>
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => handleNestedSettingChange("aiDetection", "detectionTypes", key, e.target.checked)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Concurrent Streams
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={settings.system.maxConcurrentStreams}
              onChange={(e) => handleSettingChange("system", "maxConcurrentStreams", Number.parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Backup Frequency</label>
            <select
              value={settings.system.backupFrequency}
              onChange={(e) => handleSettingChange("system", "backupFrequency", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Retention</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Video Retention (days)
            </label>
            <input
              type="number"
              min="1"
              max="365"
              value={settings.system.videoRetentionDays}
              onChange={(e) => handleSettingChange("system", "videoRetentionDays", Number.parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Log Retention (days)
            </label>
            <input
              type="number"
              min="1"
              max="365"
              value={settings.system.logRetentionDays}
              onChange={(e) => handleSettingChange("system", "logRetentionDays", Number.parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Logging Options</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">System Logs</label>
              <p className="text-sm text-gray-600 dark:text-gray-400">Enable system activity logging</p>
            </div>
            <input
              type="checkbox"
              checked={settings.system.enableSystemLogs}
              onChange={(e) => handleSettingChange("system", "enableSystemLogs", e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Performance Logs</label>
              <p className="text-sm text-gray-600 dark:text-gray-400">Enable performance monitoring logs</p>
            </div>
            <input
              type="checkbox"
              checked={settings.system.enablePerformanceLogs}
              onChange={(e) => handleSettingChange("system", "enablePerformanceLogs", e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Security Logs</label>
              <p className="text-sm text-gray-600 dark:text-gray-400">Enable security event logging</p>
            </div>
            <input
              type="checkbox"
              checked={settings.system.enableSecurityLogs}
              onChange={(e) => handleSettingChange("system", "enableSecurityLogs", e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Maintenance</h3>
        <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div>
            <label className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Maintenance Mode</label>
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              Enable maintenance mode to temporarily disable monitoring
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.system.maintenanceMode}
            onChange={(e) => handleSettingChange("system", "maintenanceMode", e.target.checked)}
            className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
          />
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Configure system preferences and options</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Navigation */}
        <div className="lg:w-64">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${activeTab === tab.id ? "text-green-600 dark:text-green-400" : ""}`} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            {activeTab === "general" && renderGeneralSettings()}
            {activeTab === "notifications" && renderNotificationSettings()}
            {activeTab === "aiDetection" && renderAIDetectionSettings()}
            {activeTab === "system" && renderSystemSettings()}

            {/* Action Buttons */}
            <div className="flex items-center space-x-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleSaveSettings}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </button>
              <button
                onClick={handleResetSettings}
                className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-2 px-6 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reset to Defaults</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
