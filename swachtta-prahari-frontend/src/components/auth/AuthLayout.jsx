"use client"

import { useState } from "react"
import LoginForm from "./LoginForm"
import SignupForm from "./SignupForm"
import ForgotPasswordForm from "./ForgotPasswordForm"
import { Leaf } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function AuthLayout({ onLogin }) {
  const [currentView, setCurrentView] = useState("login") // 'login', 'signup', 'forgot'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2 }}   // 👈 Background fade thoda slow
      className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ y: 50, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}   // 👈 Card entry slow
        className="w-full max-w-md"
      >
        {/* Logo and Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}   // 👈 Heading slow fade
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8, type: "spring", stiffness: 80, damping: 15 }} 
              className="bg-green-600 p-3 rounded-full shadow-lg"
            >
              <Leaf className="h-8 w-8 text-white" />
            </motion.div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Swachhta Prahari</h1>
          <p className="text-gray-600 dark:text-gray-300">AI Waste Management System</p>
          <p className="text-sm text-green-600 dark:text-green-400 font-medium">Sahibabad Industrial Site</p>
        </motion.div>

        {/* Auth Forms */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, scale: 1.3 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6, ease: "easeOut" }}   // 👈 Form switch smooth & slow
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
          >
            {currentView === "login" && (
              <LoginForm
                onLogin={onLogin}
                onSwitchToSignup={() => setCurrentView("signup")}
                onSwitchToForgot={() => setCurrentView("forgot")}
              />
            )}
            {currentView === "signup" && (
              <SignupForm onSignup={onLogin} onSwitchToLogin={() => setCurrentView("login")} />
            )}
            {currentView === "forgot" && <ForgotPasswordForm onBack={() => setCurrentView("login")} />}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
