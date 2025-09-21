import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import API_BASE_URL from "../../config"
import { toast } from "react-hot-toast"

const roleOptions = [
    {
        value: "payroll",
        label: "Payroll Manager",
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    },
    {
        value: "camera",
        label: "Camera Manager",
        color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    },
    {
        value: "reporting",
        label: "Reporting Manager",
        color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    },
    { value: "ai", label: "AI Manager", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" },
    { value: "analyst", label: "Data Analyst", color: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300" },
]

export default function AddManagerModal({ isOpen, onClose, onAddManager }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "",
        department: "",
        password: "",
    })
    const [showPassword, setShowPassword] = useState(false)

    
    const generateUsername = (name, role) => {
        if (!name || !role) return ""
        const firstName = name.split(" ")[0].toLowerCase()
        return `${firstName}.${role}`
    }

    const handleInputChange = (field, value) => {
        const newFormData = { ...formData, [field]: value }

        
        if (field === "name" || field === "role") {
            newFormData.username = generateUsername(
                field === "name" ? value : formData.name,
                field === "role" ? value : formData.role,
            )
        }

        setFormData(newFormData)
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { name, email, role, department, password } = formData;

        if (!name?.trim() || !email?.trim() || !role?.trim() || !department?.trim() || !password?.trim()) {
            toast.error("Please fill all required fields", { duration: 4000 });
            return;
        }

        const payload = {
            name: name.trim(),
            username: generateUsername(name.trim(), role.trim()),
            email: email.trim(),
            role: role.trim(),
            department: department.trim(),
            password: password.trim(),
            createdByAdmin: true,
        };

        console.log("Submitting payload:", payload);

        const signupPromise = new Promise(async (resolve, reject) => {
            try {
                const res = await fetch(`${API_BASE_URL}/auth/signup`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                const data = await res.json();
                console.log("Signup response:", data);

                if (data.success && data.data && data.data.user) {
                    resolve(data);
                } else {
                    reject(data.message || "Failed to add manager");
                }
            } catch (err) {
                reject("Something went wrong while signing up");
            }
        });

        toast.promise(
            signupPromise,
            {
                loading: "Creating manager account...",
                success: (data) => {
                    onAddManager(data.data.user);
                    handleClose();
                    return `✅ Manager ${data.data.user.username} added successfully!`;
                },
                error: (errMsg) => {
                    return errMsg || "Signup failed. Please try again.";
                },
            },
            {
                style: { minWidth: "250px" },
                success: { duration: 5000 },
                error: { duration: 5000 },
            }
        );
    };

    const handleClose = () => {
        setFormData({ name: "", email: "", role: "", department: "", password: "" })
        setShowPassword(false)
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 text-center">
                    Add New Manager
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Enter full name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                        <input
                            type="text"
                            value={generateUsername(formData.name, formData.role)}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                            placeholder="Auto-generated"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Auto-generated based on name and role</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Enter email address"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role *</label>
                        <select
                            value={formData.role}
                            onChange={(e) => handleInputChange("role", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="">Select role</option>
                            {roleOptions.map((role) => (
                                <option key={role.value} value={role.value}>
                                    {role.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department *</label>
                        <input
                            type="text"
                            value={formData.department}
                            onChange={(e) => handleInputChange("department", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Enter department"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password *</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={(e) => handleInputChange("password", e.target.value)}
                                className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Enter password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button
                            type="submit"
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                        >
                            Add Manager
                        </button>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
