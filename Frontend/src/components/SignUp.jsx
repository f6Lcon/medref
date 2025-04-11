"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FaUser, FaEnvelope, FaLock, FaPhoneAlt, FaCalendarAlt, FaIdCard, FaMapMarkerAlt } from "react-icons/fa"
import { Link, useNavigate } from "react-router-dom"
import PasswordStrengthBar from "react-password-strength-bar"
import axios from "axios"

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    role: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    // Address fields
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    // Doctor specific fields
    licenseNumber: "",
    specialization: "",
    // Admin specific fields
    adminCode: "",
    department: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState(1) // For multi-step form
  const navigate = useNavigate()

  // Generate a username suggestion based on email
  const generateUsername = (email) => {
    if (!email) return ""
    return email.split("@")[0]
  }

  const handleChange = (e) => {
    const { name, value, type, files } = e.target

    // If email is changed and username is empty, suggest a username
    if (name === "email" && !formData.username) {
      setFormData({
        ...formData,
        [name]: value,
        username: generateUsername(value),
      })
    } else {
      setFormData({
        ...formData,
        [name]: type === "file" ? files[0] : value,
      })
    }
  }

  const nextStep = () => {
    setStep(step + 1)
  }

  const prevStep = () => {
    setStep(step - 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Step 1: Register the user
      const userData = {
        name: formData.fullName,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        role: formData.role === "doctor" ? "doctor" : formData.role === "admin" ? "admin" : "patient",
      }

      console.log("Registering user with data:", userData)

      const response = await axios.post("http://localhost:5000/api/auth/register", userData, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("User registered successfully:", response.data)

      // Get the token from the response
      const token = response.data.token

      // Store token in localStorage
      localStorage.setItem("token", token)
      localStorage.setItem("userRole", response.data.role)

      // Step 2: Create profile based on role
      if (formData.role === "doctor") {
        // Create doctor profile
        const doctorData = {
          specialization: formData.specialization,
          licenseNumber: formData.licenseNumber,
          email: formData.email, // Explicitly include email
          contactInfo: {
            phone: formData.phoneNumber,
            email: formData.email,
          },
        }

        console.log("Creating doctor profile with data:", doctorData)

        await axios.post("http://localhost:5000/api/doctors", doctorData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        // Redirect to doctor dashboard
        window.location.href = "/doctor-dashboard"
      } else if (formData.role === "admin") {
        // Verify admin code (in a real app, this would be validated on the server)
        if (formData.adminCode !== "ADMIN123") {
          // Replace with your actual admin code verification
          setError("Invalid administrator code")
          setLoading(false)
          return
        }

        // Create admin profile
        const adminData = {
          department: formData.department,
          email: formData.email, // Explicitly include email
          contactInfo: {
            phone: formData.phoneNumber,
            email: formData.email,
          },
        }

        console.log("Creating admin profile with data:", adminData)

        await axios.post("http://localhost:5000/api/admins", adminData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        // Redirect to admin dashboard
        window.location.href = "/admin-dashboard"
      } else {
        // Create patient profile with complete address and email
        const patientData = {
          email: formData.email, // Explicitly include email
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          phoneNumber: formData.phoneNumber,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country,
          },
        }

        console.log("Creating patient profile with data:", patientData)

        await axios.post("http://localhost:5000/api/patients", patientData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        // Redirect to patient dashboard
        window.location.href = "/patient-dashboard"
      }

      alert("Registration successful!")
    } catch (error) {
      console.error("Error during registration:", error.response?.data || error.message)
      setError(error.response?.data?.message || "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Rest of the component remains the same...
  // (renderFormStep function and return statement)

  return (
    <div className="bg-light min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full"
      >
        <h2 className="text-3xl font-bold text-primary mb-6 text-center">Sign Up MEDREF</h2>

        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex justify-between">
            <div className="text-xs text-gray-500">Account</div>
            <div className="text-xs text-gray-500">Personal Info</div>
            {formData.role === "doctor" && <div className="text-xs text-gray-500">Professional</div>}
            {formData.role === "admin" && <div className="text-xs text-gray-500">Admin</div>}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
            <div
              className="bg-accent h-2.5 rounded-full transition-all duration-300"
              style={{
                width:
                  step === 1
                    ? "33%"
                    : step === 2 && formData.role !== "doctor" && formData.role !== "admin"
                      ? "100%"
                      : step === 2
                        ? "66%"
                        : step === 3 && formData.role === "doctor"
                          ? "100%"
                          : step === 3 && formData.role === "admin"
                            ? "100%"
                            : "100%",
              }}
            ></div>
          </div>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && (
            <>
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <div className="relative">
                  <FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="johndoe123"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">This will be your unique identifier in the system</p>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="johndoe@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <PasswordStrengthBar password={formData.password} />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  I am a
                </label>
                <div className="relative">
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="pl-4 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                    required
                  >
                    <option value="" disabled>
                      Select your role
                    </option>
                    <option value="doctor">Doctor</option>
                    <option value="patient">Patient</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={nextStep}
                className="w-full bg-accent text-primary font-bold py-2 px-4 rounded-md hover:bg-primary hover:text-accent transition duration-300"
              >
                Next
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <FaPhoneAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="(123) 456-7890"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <div className="relative">
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="pl-4 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                    required
                  >
                    <option value="" disabled>
                      Select gender
                    </option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Address Fields */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Address Information</h3>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    <div className="relative">
                      <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        id="street"
                        name="street"
                        value={formData.street}
                        onChange={handleChange}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="123 Main St"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="pl-4 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="New York"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                        State/Province
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="pl-4 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="NY"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Zip/Postal Code
                      </label>
                      <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        className="pl-4 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="10001"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="pl-4 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="United States"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={prevStep}
                  className="w-1/2 bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-gray-300 transition duration-300"
                >
                  Back
                </button>
                {formData.role === "doctor" || formData.role === "admin" ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="w-1/2 bg-accent text-primary font-bold py-2 px-4 rounded-md hover:bg-primary hover:text-accent transition duration-300"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="w-1/2 bg-accent text-primary font-bold py-2 px-4 rounded-md hover:bg-primary hover:text-accent transition duration-300 disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? "Signing Up..." : "Sign Up"}
                  </button>
                )}
              </div>
            </>
          )}

          {step === 3 && formData.role === "doctor" && (
            <>
              <div>
                <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization
                </label>
                <input
                  type="text"
                  id="specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="pl-4 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="e.g., Cardiology, Neurology"
                  required
                />
              </div>

              <div>
                <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  License Number
                </label>
                <input
                  type="text"
                  id="licenseNumber"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  className="pl-4 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Your medical license number"
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={prevStep}
                  className="w-1/2 bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-gray-300 transition duration-300"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-accent text-primary font-bold py-2 px-4 rounded-md hover:bg-primary hover:text-accent transition duration-300 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? "Signing Up..." : "Sign Up"}
                </button>
              </div>
            </>
          )}

          {step === 3 && formData.role === "admin" && (
            <>
              <div>
                <label htmlFor="adminCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Administrator Code
                </label>
                <input
                  type="text"
                  id="adminCode"
                  name="adminCode"
                  value={formData.adminCode}
                  onChange={handleChange}
                  className="pl-4 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Enter administrator verification code"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">This code is required to create an administrator account</p>
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="pl-4 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="e.g., IT, Management, Operations"
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={prevStep}
                  className="w-1/2 bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-gray-300 transition duration-300"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-accent text-primary font-bold py-2 px-4 rounded-md hover:bg-primary hover:text-accent transition duration-300 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? "Signing Up..." : "Sign Up"}
                </button>
              </div>
            </>
          )}
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-accent hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default SignUp
