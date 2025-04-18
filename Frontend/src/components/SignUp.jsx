"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FaUser, FaEnvelope, FaLock, FaPhoneAlt, FaCalendarAlt, FaIdCard, FaMapMarkerAlt } from "react-icons/fa"
import { Link, useNavigate } from "react-router-dom"
import PasswordStrengthBar from "react-password-strength-bar"
import axios from "axios"

const API_URL = "http://localhost:5000"

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
    hospital: "",
    // Admin specific fields
    adminCode: "",
    department: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState(1) // For multi-step form
  const navigate = useNavigate()

  const [hospitals, setHospitals] = useState([])

  // Add a new state for phone number validation
  const [phoneError, setPhoneError] = useState("")

  useEffect(() => {
    // Fetch hospitals for doctor registration
    const fetchHospitals = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/hospitals`)
        setHospitals(response.data)
      } catch (error) {
        console.error("Error fetching hospitals:", error)
      }
    }

    // Only fetch hospitals if the user is registering as a doctor and reaches step 3
    if (formData.role === "doctor" && step === 3) {
      fetchHospitals()
    }
  }, [formData.role, step])

  // Generate a username suggestion based on email
  const generateUsername = (email) => {
    if (!email) return ""
    return email.split("@")[0]
  }

  // Add this function after the generateUsername function
  const validateKenyanPhoneNumber = (phoneNumber) => {
    // Remove any spaces, dashes or parentheses
    const cleanedNumber = phoneNumber.replace(/[\s\-()]/g, "")

    // Check if it's a valid Kenyan format
    // Format 1: +254 followed by 9 digits (international format)
    // Format 2: 0 followed by 9 digits (local format)
    const kenyanRegex = /^(?:\+254|0)[17]\d{8}$/

    if (!kenyanRegex.test(cleanedNumber)) {
      return false
    }

    return true
  }

  // Modify the handleChange function to validate phone numbers
  const handleChange = (e) => {
    const { name, value, type, files } = e.target

    // If phone number is being changed, validate it
    if (name === "phoneNumber") {
      if (value && !validateKenyanPhoneNumber(value)) {
        setPhoneError("Please enter a valid Kenyan phone number (e.g., 07XX XXX XXX or +254 7XX XXX XXX)")
      } else {
        setPhoneError("")
      }
    }

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

  // Modify the handleSubmit function to check phone validation before submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Check if phone number is valid before proceeding
    if (formData.phoneNumber && !validateKenyanPhoneNumber(formData.phoneNumber)) {
      setPhoneError("Please enter a valid Kenyan phone number (e.g., 07XX XXX XXX or +254 7XX XXX XXX)")
      return
    }

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

      const response = await axios.post(`${API_URL}/api/auth/register`, userData, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("User registered successfully:", response.data)

      // Store profile data in sessionStorage for later use after email verification
      const profileData = {
        email: formData.email,
        role: userData.role,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        specialization: formData.specialization,
        licenseNumber: formData.licenseNumber,
        hospital: formData.hospital,
        department: formData.department,
        adminCode: formData.adminCode,
      }

      // Store profile data in sessionStorage
      sessionStorage.setItem("pendingProfileData", JSON.stringify(profileData))

      // Store email in localStorage for verification page
      localStorage.setItem("pendingVerificationEmail", formData.email)

      // Navigate to email verification page
      navigate("/verify-email", { state: { email: formData.email } })
    } catch (error) {
      console.error("Error during registration:", error.response?.data || error.message)
      setError(error.response?.data?.message || "Registration failed. Please try again.")
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
                  Phone Number (Kenyan format)
                </label>
                <div className="relative">
                  <FaPhoneAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className={`pl-10 pr-4 py-2 w-full border ${
                      phoneError ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 ${
                      phoneError ? "focus:ring-red-500" : "focus:ring-accent"
                    }`}
                    placeholder="07XX XXX XXX or +254 7XX XXX XXX"
                    required
                  />
                </div>
                {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  Enter a valid Kenyan mobile number (e.g., 0712 345 678 or +254 712 345 678)
                </p>
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
                        placeholder="Nakuru"
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
                        placeholder="Costal"
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
                        placeholder="60200"
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
                        placeholder="Kenya"
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

              <div>
                <label htmlFor="hospital" className="block text-sm font-medium text-gray-700 mb-1">
                  Hospital
                </label>
                <select
                  id="hospital"
                  name="hospital"
                  value={formData.hospital}
                  onChange={handleChange}
                  className="pl-4 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                >
                  <option value="">Select your hospital</option>
                  {hospitals.map((hospital) => (
                    <option key={hospital._id} value={hospital._id}>
                      {hospital.name}
                    </option>
                  ))}
                </select>
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
