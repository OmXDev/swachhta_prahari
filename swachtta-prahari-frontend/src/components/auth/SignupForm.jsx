import { useState } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { Eye, EyeOff, Mail, Lock, User, Shield } from "lucide-react"
import toast from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"

export default function SignupForm({ onSignup, onSwitchToLogin }) {
  const { signup, sendOTP, verifyOTP, isLoading } = useAuth()
  const [step, setStep] = useState(1) // 1: form, 2: otp verification
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  })
  const [otp, setOtp] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    if (step === 1) {
      const newErrors = {}
      if (!formData.email) newErrors.email = "Email is required"
      if (!formData.username) newErrors.username = "Username is required"
      if (!formData.password) newErrors.password = "Password is required"
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }

      const otpPromise = sendOTP(formData.email)
      toast.promise(otpPromise, {
        loading: "Sending OTP...",
        success: () => {
          setStep(2)
          return "OTP sent successfully! Check your email."
        },
        error: (err) => {
          setErrors({ general: err.message || "Failed to send OTP" })
          return "Failed to send OTP."
        },
      })
    } else {
      if (!otp) {
        setErrors({ otp: "OTP is required" })
        return
      }

      const signupPromise = new Promise(async (resolve, reject) => {
        try {
          const isValid = await verifyOTP(formData.email, otp)
          if (isValid) {
            await signup({ ...formData, otp })
            resolve()
          } else {
            setErrors({ otp: "Invalid OTP" })
            reject("Invalid OTP")
          }
        } catch (error) {
          setErrors({ general: error.message || "Failed to create account" })
          reject(error.message || "Failed to create account")
        }
      })

      toast.promise(
        signupPromise,
        {
          loading: "Creating your account...",
          success: () => {
            onSignup()
            return "Signup successful! 🎉"
          },
          error: (errMsg) => errMsg || "Something went wrong!",
        },
        {
          style: {
            background: "#fff",
            color: "#111827",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "12px 16px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
            minWidth: "250px",
          },
          success: {
            iconTheme: { primary: "#22c55e", secondary: "#fff" },
            duration: 5000,
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#fff" },
            duration: 5000,
          },
        }
      )
    }
  }

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <AnimatePresence mode="wait">
      {step === 1 ? (
        <motion.div
          key="form"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 1.0, ease: "easeOut" }}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Create Account
          </h2>

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 1.0 }}
          >
            {errors.general && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {errors.general}
              </div>
            )}

            {/* Email */}
            <motion.div whileFocus={{ scale: 1.02 }}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <motion.input
                  whileFocus={{ scale: 1.02, boxShadow: "0 0 12px rgba(34,197,94,0.3)" }}
                  transition={{ duration: 0.3 }}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </motion.div>

            {/* Username */}
            <motion.div whileFocus={{ scale: 1.02 }}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <motion.input
                  whileFocus={{ scale: 1.02, boxShadow: "0 0 12px rgba(34,197,94,0.3)" }}
                  transition={{ duration: 0.3 }}
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Choose a username"
                />
              </div>
              {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
            </motion.div>

            {/* Password */}
            <motion.div whileFocus={{ scale: 1.02 }}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <motion.input
                  whileFocus={{ scale: 1.02, boxShadow: "0 0 12px rgba(34,197,94,0.3)" }}
                  transition={{ duration: 0.3 }}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Create a password"
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

            {/* Confirm Password */}
            <motion.div whileFocus={{ scale: 1.02 }}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <motion.input
                  whileFocus={{ scale: 1.02, boxShadow: "0 0 12px rgba(34,197,94,0.3)" }}
                  transition={{ duration: 0.3 }}
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </motion.div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.05, boxShadow: "0 6px 20px rgba(34,197,94,0.5)" }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </motion.button>
          </motion.form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <button onClick={onSwitchToLogin} className="text-green-600 hover:text-green-500 font-medium">
                Sign in
              </button>
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="otp"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 1.0, ease: "easeOut" }}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Verify Your Email
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            We've sent a verification code to {formData.email}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Verification Code
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <motion.input
                  whileFocus={{ scale: 1.03, boxShadow: "0 0 14px rgba(34,197,94,0.4)" }}
                  transition={{ duration: 0.3 }}
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-lg tracking-widest"
                  placeholder="123456"
                  maxLength={6}
                />
              </div>
              {errors.otp && <p className="text-red-500 text-sm mt-1">{errors.otp}</p>}
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.05, boxShadow: "0 6px 20px rgba(34,197,94,0.5)" }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {isLoading ? "Verifying..." : "Verify & Create Account"}
            </motion.button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Back to form
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
