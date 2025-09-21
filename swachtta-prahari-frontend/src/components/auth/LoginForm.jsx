import { useState } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { Eye, EyeOff, Lock, User } from "lucide-react"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import API_BASE_URL from "../../config"

export default function LoginForm({ onLogin, onSwitchToSignup, onSwitchToForgot }) {
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    const newErrors = {}
    if (!formData.username) newErrors.username = "Username or email is required"
    if (!formData.password) newErrors.password = "Password is required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const loginPromise = new Promise(async (resolve, reject) => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })

        const data = await res.json()

        if (data.success && data.data && data.data.user) {
          resolve({
            user: data.data.user,
            token: data.data.token,
            refreshToken: data.data.refreshToken,
          })
        } else {
          reject(data.message || "Login failed. Please try again.")
        }
      } catch (error) {
        reject("Invalid credentials")
      }
    })

    toast.promise(
      loginPromise,
      {
        loading: "Logging you in...",
        success: (data) => {
          localStorage.setItem("accessToken", data.token)
          localStorage.setItem("refreshToken", data.refreshToken)

          login(data.user)
          navigate("/", { replace: true })

          return `Welcome back! 🎉 ${data.user.username}`
        },
        error: (errMsg) => {
          setErrors({ general: errMsg })
          return errMsg || "Login failed. Please try again."
        },
      },
      {
        style: { minWidth: "250px" },
        success: { duration: 5000 },
        error: { duration: 5000 },
      }
    )
  }

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.2 } },
      }}
    >
      <motion.h2
        variants={{ hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0 } }}
        className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center"
      >
        Welcome Back
      </motion.h2>

      <motion.form
        onSubmit={handleSubmit}
        className="space-y-4"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
      >
        {errors.general && (
          <motion.div
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm"
          >
            {errors.general}
          </motion.div>
        )}

        {/* Username Field */}
        <motion.div variants={{ hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0 } }}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Username or Email</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter username or email"
            />
          </div>
          {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
        </motion.div>

        {/* Password Field */}
        <motion.div variants={{ hidden: { opacity: 0, x: 30 }, visible: { opacity: 1, x: 0 } }}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </motion.div>

        {/* Options */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
          className="flex items-center justify-between"
        >
          <label className="flex items-center">
            <input type="checkbox" className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" />
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Remember me</span>
          </label>
          <button type="button" onClick={onSwitchToForgot} className="text-sm text-green-600 hover:text-green-500">
            Forgot password?
          </button>
        </motion.div>

        {/* Button */}
        <motion.button
          type="submit"
          disabled={isLoading}
          variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </motion.button>
      </motion.form>

      <motion.div
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
        className="mt-6 text-center"
      >
        <p className="text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <button onClick={onSwitchToSignup} className="text-green-600 hover:text-green-500 font-medium">
            Sign up
          </button>
        </p>
      </motion.div>
    </motion.div>
  )
}
