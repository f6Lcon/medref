"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import axios from "axios"
import { motion } from "framer-motion"
import { FaEnvelope, FaCheck } from "react-icons/fa"

const API_URL = "http://localhost:5000"

const EmailVerification = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [resendDisabled, setResendDisabled] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [redirecting, setRedirecting] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()
  const email = location.state?.email || ""

  useEffect(() => {
    if (!email) {
      navigate("/signup")
    }

    // Countdown timer for resend button
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false)
    }
  }, [email, navigate, countdown, resendDisabled])

  const handleChange = (e, index) => {
    const value = e.target.value

    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return

    // Update the OTP array
    const newOtp = [...otp]
    newOtp[index] = value.substring(0, 1) // Only take the first character
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleKeyDown = (e, index) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").trim()

    // Check if pasted content is a 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("")
      setOtp(newOtp)

      // Focus the last input
      const lastInput = document.getElementById("otp-5")
      if (lastInput) lastInput.focus()
    }
  }

  const handleVerify = async () => {
    const otpValue = otp.join("")

    if (otpValue.length !== 6) {
      setError("Please enter all 6 digits of the OTP")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await axios.post(`${API_URL}/api/auth/verify`, {
        email,
        otp: otpValue,
      })

      setSuccess(true)
      setRedirecting(true)

      // Get the profile data stored during signup
      const profileData = JSON.parse(sessionStorage.getItem("pendingProfileData") || "{}")
      const token = response.data.token
      const role = response.data.role || profileData.role

      // Store token in localStorage
      localStorage.setItem("token", token)
      localStorage.setItem("userRole", role)

      // Create profile based on role
      try {
        if (role === "doctor") {
          // Create doctor profile
          const doctorData = {
            specialization: profileData.specialization,
            licenseNumber: profileData.licenseNumber,
            email: profileData.email,
            contactInfo: {
              phone: profileData.phoneNumber,
              email: profileData.email,
            },
          }

          await axios.post(`${API_URL}/api/doctors`, doctorData, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          })

          // Clear stored data
          sessionStorage.removeItem("pendingProfileData")

          // Redirect to doctor dashboard after a short delay
          setTimeout(() => {
            window.location.href = "/doctor-dashboard"
          }, 1500)
        } else if (role === "admin") {
          // Create admin profile
          const adminData = {
            department: profileData.department,
            email: profileData.email,
            contactInfo: {
              phone: profileData.phoneNumber,
              email: profileData.email,
            },
          }

          await axios.post(`${API_URL}/api/admins`, adminData, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          })

          // Clear stored data
          sessionStorage.removeItem("pendingProfileData")

          // Redirect to admin dashboard after a short delay
          setTimeout(() => {
            window.location.href = "/admin-dashboard"
          }, 1500)
        } else {
          // Create patient profile
          const patientData = {
            email: profileData.email,
            dateOfBirth: profileData.dateOfBirth,
            gender: profileData.gender,
            phoneNumber: profileData.phoneNumber,
            address: {
              street: profileData.street,
              city: profileData.city,
              state: profileData.state,
              zipCode: profileData.zipCode,
              country: profileData.country,
            },
          }

          await axios.post(`${API_URL}/api/patients`, patientData, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          })

          // Clear stored data
          sessionStorage.removeItem("pendingProfileData")

          // Redirect to patient dashboard after a short delay
          setTimeout(() => {
            window.location.href = "/patient-dashboard"
          }, 1500)
        }
      } catch (profileError) {
        console.error("Error creating profile:", profileError)
        // Even if profile creation fails, redirect to dashboard
        setTimeout(() => {
          window.location.href =
            role === "doctor" ? "/doctor-dashboard" : role === "admin" ? "/admin-dashboard" : "/patient-dashboard"
        }, 1500)
      }
    } catch (error) {
      console.error("Verification error:", error.response?.data || error.message)
      setError(error.response?.data?.message || "Verification failed. Please try again.")
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setLoading(true)
    setError("")
    setResendDisabled(true)
    setCountdown(60) // 60 seconds cooldown

    try {
      await axios.post(`${API_URL}/api/auth/resend-otp`, { email })
      setError("") // Clear any previous errors
    } catch (error) {
      console.error("Error resending OTP:", error.response?.data || error.message)
      setError(error.response?.data?.message || "Failed to resend OTP. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-light min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full"
      >
        {success ? (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <FaCheck className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Verified!</h2>
            <p className="text-gray-600 mb-4">
              Your email has been successfully verified. {redirecting ? "Redirecting you to your dashboard..." : ""}
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-accent bg-opacity-20 mb-4">
                <FaEnvelope className="h-8 w-8 text-accent" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h2>
              <p className="text-gray-600">
                We've sent a verification code to <span className="font-medium">{email}</span>
              </p>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Enter 6-digit verification code</label>
              <div className="flex gap-2 justify-between">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                    autoFocus={index === 0}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={handleVerify}
              disabled={loading || otp.join("").length !== 6}
              className="w-full bg-accent text-primary font-bold py-3 px-4 rounded-md hover:bg-primary hover:text-accent transition duration-300 disabled:opacity-50 mb-4"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>

            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">Didn't receive the code?</p>
              <button
                onClick={handleResendOTP}
                disabled={loading || resendDisabled}
                className="text-accent hover:underline font-medium disabled:opacity-50 disabled:no-underline"
              >
                {resendDisabled ? `Resend code in ${countdown}s` : "Resend code"}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}

export default EmailVerification
