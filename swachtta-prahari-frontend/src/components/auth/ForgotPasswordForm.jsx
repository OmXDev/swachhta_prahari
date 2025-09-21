"use client"

import { useState } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { Mail, Lock, Shield, ArrowLeft } from "lucide-react"
import toast from "react-hot-toast"
import API_BASE_URL from "../../config"

export default function ForgotPasswordForm({ onBack }) {
  const { sendOTP, verifyOTP, resetPassword, isLoading } = useAuth()
  const [step, setStep] = useState(1) // 1: email, 2: otp, 3: new password
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (step === 1) {
        if (!email) {
            setErrors({ email: "Email is required" });
            return;
        }

        const otpPromise = fetch(`${API_BASE_URL}/auth/get-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, purpose: "login" }),
        }).then(res => {
            if (!res.ok) {
                return res.json().then(data => Promise.reject(data.message || 'Failed to send OTP'));
            }
            return res.json();
        });

        toast.promise(
            otpPromise,
            {
                loading: 'Sending OTP...',
                success: (data) => {
                    setStep(2);
                    return 'OTP sent successfully! Check your email.';
                },
                error: (errMsg) => {
                    setErrors({ general: errMsg });
                    return errMsg;
                },
            }
        );

    } else if (step === 2) {
        if (!otp) {
            setErrors({ otp: "OTP is required" });
            return;
        }

        const verifyPromise = fetch(`${API_BASE_URL}/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp }),
        }).then(res => {
            if (!res.ok) {
                return res.json().then(data => Promise.reject(data.message || 'Invalid OTP'));
            }
            return res.json();
        }).then(data => {
            if (!data.success) {
                return Promise.reject(data.message || "Invalid OTP");
            }
            return data;
        });

        toast.promise(
            verifyPromise,
            {
                loading: 'Verifying OTP...',
                success: () => {
                    setStep(3);
                    return 'OTP verified! You can now reset your password.';
                },
                error: (errMsg) => {
                    setErrors({ otp: errMsg });
                    return errMsg;
                },
            }
        );

    } else {
        if (!newPassword) {
            setErrors({ password: "Password is required" });
            return;
        }
        if (newPassword !== confirmPassword) {
            setErrors({ confirmPassword: "Passwords do not match" });
            return;
        }

        const resetPasswordPromise = fetch(`${API_BASE_URL}/auth/updatepassword`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, newPassword: newPassword }),
        }).then(res => {
            if (!res.ok) {
                return res.json().then(data => Promise.reject(data.message || 'Failed to update password'));
            }
            return res.json();
        }).then(data => {
            if (!data.success) {
                return Promise.reject(data.message || 'Failed to update password');
            }
            return data;
        });

        toast.promise(
            resetPasswordPromise,
            {
                loading: 'Resetting password...',
                success: () => {
                    setSuccess(true);
                    return 'Password reset successfully! 🎉';
                },
                error: (errMsg) => {
                    setErrors({ general: errMsg });
                    return errMsg;
                },
            }
        );
    }
};

  if (success) {
    return (
      <div className="text-center">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-6">
          <div className="text-green-600 dark:text-green-400 text-4xl mb-4">✓</div>
          <h2 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">Password Reset Successful</h2>
          <p className="text-green-600 dark:text-green-400">Your password has been updated successfully.</p>
        </div>
        <button
          onClick={onBack}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          Back to Login
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-600 mr-3">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reset Password</h2>
      </div>

      {step === 1 && (
        <div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Enter your email address and we'll send you a verification code.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {errors.general}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {isLoading ? "Sending..." : "Send Verification Code"}
            </button>
          </form>
        </div>
      )}

      {step === 2 && (
        <div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Enter the verification code sent to {email}</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {errors.general}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Verification Code
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
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
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </button>
          </form>
        </div>
      )}

      {step === 3 && (
        <div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Create a new password for your account.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {errors.general}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter new password"
                />
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Confirm new password"
                />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {isLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
