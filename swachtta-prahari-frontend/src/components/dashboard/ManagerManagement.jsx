import { useState, useEffect, useCallback } from "react"
import { Plus, Search, Edit, Trash2, UserCheck, UserX, Shield } from "lucide-react"
import AddManagerModal from "./AddManagerModal"
import API_BASE_URL from "../../config"
import EditManagerModal from "./EditManagerModal"
import { toast } from "react-hot-toast"

const roleOptions = [
    { value: "payroll", label: "Payroll Manager", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
    { value: "camera", label: "Camera Manager", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" },
    { value: "reporting", label: "Reporting Manager", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
    { value: "ai", label: "AI Manager", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" },
    { value: "analyst", label: "Data Analyst", color: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300" },
]

export default function ManagerManagement() {
    const [managers, setManagers] = useState([])
    const [loading, setLoading] = useState(true)
    const [showAddForm, setShowAddForm] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedRole, setSelectedRole] = useState("all")
    const [editingManager, setEditingManager] = useState(null)

    
    const fetchManagers = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/managers`)
            const data = await res.json()
            if (data.success) {
                setManagers(data.data)
            } else {
                console.error("Failed to fetch managers:", data.message)
            }
        } catch (err) {
            console.error("Error fetching managers:", err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchManagers()
    }, [fetchManagers])


    const handleUpdateManager = async (id, updatedData) => {
        const updatePromise = new Promise(async (resolve, reject) => {
            try {
                const res = await fetch(`${API_BASE_URL}/admin/managers/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedData),
                })

                const data = await res.json()

                if (data.success) {
                    setManagers((prev) =>
                        prev.map((m) => (m._id === id ? { ...m, ...data.data } : m))
                    )
                    setEditingManager(null) // close modal
                    resolve(data.data)
                } else {
                    reject(data.message || "Failed to update manager")
                }
            } catch (err) {
                reject("Something went wrong while updating manager")
            }
        })

        toast.promise(
            updatePromise,
            {
                loading: "Updating manager details...",
                success: (manager) => ` Manager ${manager.username || manager.name} updated successfully!`,
                error: (errMsg) => errMsg || "Update failed. Please try again.",
            },
            {
                style: { minWidth: "250px" },
                success: { duration: 5000 },
                error: { duration: 5000 },
            }
        )
    }


    const handleAddManager = async (newManager) => {
        setShowAddForm(false)
        await fetchManagers()
    }


    const toggleManagerStatus = async (id) => {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/managers/${id}/toggle-status`, {
                method: "PATCH",
            })
            const data = await res.json()
            if (data.success) {
                setManagers((prev) =>
                    prev.map((m) => (m._id === id ? { ...m, status: data.data.status } : m))
                )
            }
        } catch (err) {
            console.error("Error toggling status:", err)
        }
    }

    
    const deleteManager = async (id) => {
        if (!confirm("Are you sure you want to delete this manager?")) return
        try {
            const res = await fetch(`${API_BASE_URL}/admin/managers/${id}`, {
                method: "DELETE",
            })
            const data = await res.json()
            if (data.success) {
                setManagers((prev) => prev.filter((m) => m._id !== id))
            }
        } catch (err) {
            console.error("Error deleting manager:", err)
        }
    }

    
    const filteredManagers = managers.filter((manager) => {
        const matchesSearch =
            manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            manager.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            manager.username.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRole = selectedRole === "all" || manager.role === selectedRole
        return matchesSearch && matchesRole
    })

    const getRoleStyle = (role) => {
        const roleOption = roleOptions.find((option) => option.value === role)
        return roleOption ? roleOption.color : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }

    const getRoleLabel = (role) => {
        const roleOption = roleOptions.find((option) => option.value === role)
        return roleOption ? roleOption.label : role
    }

    if (loading) {
        return <p className="text-gray-600 dark:text-gray-300">Loading managers...</p>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manager Management</h1>
                    <p className="text-gray-600 dark:text-gray-400">Create and manage system managers</p>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    <span>Add Manager</span>
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Managers</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{managers.length}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Managers</p>
                    <p className="text-2xl font-bold text-green-600">
                        {managers.filter((m) => m.status === "active").length}
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Inactive Managers</p>
                    <p className="text-2xl font-bold text-red-600">
                        {managers.filter((m) => m.status === "inactive").length}
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Departments</p>
                    <p className="text-2xl font-bold text-blue-600">{new Set(managers.map((m) => m.department)).size}</p>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search managers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        <option value="all">All Roles</option>
                        {roleOptions.map((role) => (
                            <option key={role.value} value={role.value}>
                                {role.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-950">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Manager
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Department
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Last Login
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                            {filteredManagers.map((manager) => (
                                <tr key={manager._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">{manager.name}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{manager.email}</div>
                                            <div className="text-xs text-gray-400 dark:text-gray-500">@{manager.username}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleStyle(manager.role)}`}>
                                            {getRoleLabel(manager.role)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{manager.department}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${manager.status === "active"
                                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                                }`}
                                        >
                                            {manager.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{manager.lastLogin}</td>
                                    <td className="px-6 py-4 flex items-center space-x-2">
                                        {/* <button
                      onClick={() => toggleManagerStatus(manager._id)}
                      className={`p-1 rounded ${
                        manager.status === "active"
                          ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          : "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                      }`}
                      title={manager.status === "active" ? "Deactivate" : "Activate"}
                    >
                      {manager.status === "active" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    </button> */}
                                        <button
                                            onClick={() => setEditingManager(manager)}
                                            className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-1 rounded" title="Edit">
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteManager(manager._id)}
                                            className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <AddManagerModal isOpen={showAddForm} onClose={() => setShowAddForm(false)} onAddManager={handleAddManager} />
            <EditManagerModal
                isOpen={!!editingManager}
                manager={editingManager}
                onClose={() => setEditingManager(null)}
                onUpdateManager={handleUpdateManager}
            />

        </div>
    )
}
