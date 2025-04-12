"use client"

import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import axios from "axios"
import { FaKey, FaRedo } from "react-icons/fa"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

const EmailVerification = () => {
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [resendLoading, setResendLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Get email from location state or localStorage
  const email = location.state?.email || localStorage.getItem("pendingVerificationEmail")

  if (!email) {
    // If no email is found, redirect to login
    navigate("/login")
    return null
  }

  // Store email in localStorage for persistence
  if (location.state?.email) {
    localStorage.setItem("pendingVerificationEmail", location.state.email)
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await axios.post(`${API_URL}/api/auth/verify`, {
        email,
        otp,
      })

      setSuccess(response.data.message)

      // Store token if provided
      if (response.data.token) {
        localStorage.setItem("token", response.data.token)
        localStorage.setItem("userRole", response.data.role)

        // Remove pending verification email
        localStorage.removeItem("pendingVerificationEmail")

        // Redirect based on user role
        setTimeout(() => {
          if (response.data.role === "doctor") {
            window.location.href = "/doctor-dashboard"
          } else if (response.data.role === "patient") {
            window.location.href = "/patient-dashboard"
          } else if (response.data.role === "admin") {
            window.location.href = "/admin-dashboard"
          } else {
            window.location.href = "/"
          }
        }, 2000)
      } else {
        // If no token, redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/login")
        }, 2000)
      }
    } catch (err) {
      console.error("Verification error:", err)
      setError(err.response?.data?.message || "Verification failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setResendLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await axios.post(`${API_URL}/api/auth/resend-otp`, {
        email,
      })

      setSuccess(response.data.message)
    } catch (err) {
      console.error("Resend OTP error:", err)
      setError(err.response?.data?.message || "Failed to resend verification code. Please try again.")
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="bg-light min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-3xl font-bold text-primary mb-2 text-center">Verify Your Email</h2>
        <p className="text-gray-600 text-center mb-6">
          We've sent a verification code to <strong>{email}</strong>
        </p>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
              Verification Code
            </label>
            <div className="relative">
              <FaKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Enter 6-digit code"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-accent text-primary font-bold py-2 px-4 rounded-md hover:bg-primary hover:text-accent transition duration-300 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Didn't receive the code?{" "}
            <button
              onClick={handleResendOTP}
              className="text-accent hover:underline inline-flex items-center disabled:opacity-50"
              disabled={resendLoading}
            >
              {resendLoading ? "Sending..." : "Resend Code"} {!resendLoading && <FaRedo className="ml-1" size={12} />}
            </button>
          </p>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Wrong email?{" "}
            <button
              onClick={() => {
                localStorage.removeItem("pendingVerificationEmail")
                navigate("/signup")
              }}
              className="text-accent hover:underline"
            >
              Go back to sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default EmailVerification
