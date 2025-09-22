import API_BASE_URL from "../config"
import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const API_BASE = `${API_BASE_URL}/auth`

  //  Restore user + token from localStorage when app starts
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    const token = localStorage.getItem("accessToken")

    if (storedUser && token) {
      setUser(JSON.parse(storedUser))
    } 

    setIsLoading(false)
  }, [])

  const login = (userData, tokens) => {
    setUser(userData)

    localStorage.setItem("user", JSON.stringify(userData))
    if (tokens?.accessToken) {
      localStorage.setItem("accessToken", tokens.accessToken)
    }
    if (tokens?.refreshToken) {
      localStorage.setItem("refreshToken", tokens.refreshToken)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
  }

  const verifySession = async (token) => {
    try {
      const res = await fetch(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await res.json()
      if (res.ok && data.success && data.data?.user) {
        setUser(data.data.user)
        localStorage.setItem("user", JSON.stringify(data.data.user))
      } else {
        logout()
      }
    } catch (err) {
      logout()
    }
  }

  const signup = async ({ email, username, password, confirmPassword, otp }) => {
    const res = await fetch(`${API_BASE}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password, confirmPassword, otp }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message || "Failed to signup")
    return data
  }

  const sendOTP = async (email) => {
    const res = await fetch(`${API_BASE}/get-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, purpose: "signup" }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message || "Failed to send OTP")
    return data
  }

  const verifyOTP = async (email, otp) => {
    const res = await fetch(`${API_BASE}/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message || "Failed to verify OTP")
    return data.success
  }

  const resetPassword = async (email, newPassword) => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    signup,
    sendOTP,
    verifyOTP,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
