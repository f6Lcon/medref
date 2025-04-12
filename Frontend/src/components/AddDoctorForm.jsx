"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { FaUserMd, FaHospital, FaIdCard, FaEnvelope, FaPhone, FaGraduationCap, FaCalendarAlt } from "react-icons/fa"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

const AddDoctorForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    username: "", // Added username field
    email: "",
    password: "",
    specialization: "",
    licenseNumber: "",
    hospital: "",
    contactInfo: {
      email: "",
      phone: "",
    },
    education: [{ degree: "", institution: "", year: "" }],
    experience: [{ position: "", hospital: "", from: "", to: "" }],
  })
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return

        const response = await axios.get(`${API_URL}/api/hospitals`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setHospitals(response.data)
      } catch (err) {
        console.error("Error fetching hospitals:", err)
        setError("Failed to load hospitals. Please try again.")
      }
    }

    fetchHospitals()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name.includes("contactInfo.")) {
      const field = name.split(".")[1]
      setFormData({
        ...formData,
        contactInfo: {
          ...formData.contactInfo,
          [field]: value,
        },
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...formData.education]
    updatedEducation[index][field] = value
    setFormData({
      ...formData,
      education: updatedEducation,
    })
  }

  const handleExperienceChange = (index, field, value) => {
    const updatedExperience = [...formData.experience]
    updatedExperience[index][field] = value
    setFormData({
      ...formData,
      experience: updatedExperience,
    })
  }

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...formData.education, { degree: "", institution: "", year: "" }],
    })
  }

  const removeEducation = (index) => {
    const updatedEducation = [...formData.education]
    updatedEducation.splice(index, 1)
    setFormData({
      ...formData,
      education: updatedEducation,
    })
  }

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [...formData.experience, { position: "", hospital: "", from: "", to: "" }],
    })
  }

  const removeExperience = (index) => {
    const updatedExperience = [...formData.experience]
    updatedExperience.splice(index, 1)
    setFormData({
      ...formData,
      experience: updatedExperience,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("You must be logged in to add a doctor")
        setLoading(false)
        return
      }

      // Ensure contactInfo email matches the main email
      formData.contactInfo.email = formData.email

      // Step 1: Register the user with doctor role
      const userData = {
        name: formData.name,
        username: formData.username, // Include username
        email: formData.email,
        password: formData.password,
        role: "doctor",
      }

      const userResponse = await axios.post(`${API_URL}/api/auth/register`, userData, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      // Step 2: Create doctor profile using the token from registration
      const doctorToken = userResponse.data.token

      const doctorData = {
        email: formData.email,
        specialization: formData.specialization,
        licenseNumber: formData.licenseNumber,
        hospital: formData.hospital,
        education: formData.education,
        experience: formData.experience,
        contactInfo: formData.contactInfo,
      }

      const doctorResponse = await axios.post(`${API_URL}/api/doctors`, doctorData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${doctorToken}`,
        },
      })

      // Call success callback
      if (onSuccess) {
        onSuccess(doctorResponse.data)
      }

      // Reset form
      setFormData({
        name: "",
        username: "",
        email: "",
        password: "",
        specialization: "",
        licenseNumber: "",
        hospital: "",
        contactInfo: {
          email: "",
          phone: "",
        },
        education: [{ degree: "", institution: "", year: "" }],
        experience: [{ position: "", hospital: "", from: "", to: "" }],
      })
    } catch (err) {
      console.error("Error adding doctor:", err)
      setError(err.response?.data?.message || "Failed to add doctor. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Add New Doctor</h2>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">
            <FaUserMd className="inline mr-2" /> Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Dr. John Doe"
                required
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username*
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="dr_johndoe"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                <FaEnvelope className="inline mr-1" /> Email Address*
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="doctor@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password*
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">
            <FaIdCard className="inline mr-2" /> Professional Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
                Specialization*
              </label>
              <input
                type="text"
                id="specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Cardiology, Neurology"
                required
              />
            </div>

            <div>
              <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-1">
                License Number*
              </label>
              <input
                type="text"
                id="licenseNumber"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., MD12345"
                required
              />
            </div>

            <div>
              <label htmlFor="hospital" className="block text-sm font-medium text-gray-700 mb-1">
                <FaHospital className="inline mr-1" /> Hospital
              </label>
              <select
                id="hospital"
                name="hospital"
                value={formData.hospital}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select a hospital</option>
                {hospitals.map((hospital) => (
                  <option key={hospital._id} value={hospital._id}>
                    {hospital.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="contactInfo.phone" className="block text-sm font-medium text-gray-700 mb-1">
                <FaPhone className="inline mr-1" /> Phone Number
              </label>
              <input
                type="tel"
                id="contactInfo.phone"
                name="contactInfo.phone"
                value={formData.contactInfo.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="(123) 456-7890"
              />
            </div>
          </div>
        </div>

        {/* Education */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium text-gray-800">
              <FaGraduationCap className="inline mr-2" /> Education
            </h3>
            <button type="button" onClick={addEducation} className="text-sm text-primary hover:text-accent">
              + Add Education
            </button>
          </div>

          {formData.education.map((edu, index) => (
            <div key={index} className="p-4 border rounded-md mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => handleEducationChange(index, "degree", e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., MD, PhD"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => handleEducationChange(index, "institution", e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., Harvard Medical School"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <input
                    type="number"
                    value={edu.year}
                    onChange={(e) => handleEducationChange(index, "year", e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., 2015"
                  />
                </div>
              </div>
              {formData.education.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEducation(index)}
                  className="mt-2 text-sm text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Experience */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium text-gray-800">
              <FaCalendarAlt className="inline mr-2" /> Experience
            </h3>
            <button type="button" onClick={addExperience} className="text-sm text-primary hover:text-accent">
              + Add Experience
            </button>
          </div>

          {formData.experience.map((exp, index) => (
            <div key={index} className="p-4 border rounded-md mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <input
                    type="text"
                    value={exp.position}
                    onChange={(e) => handleExperienceChange(index, "position", e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., Attending Physician"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hospital/Institution</label>
                  <input
                    type="text"
                    value={exp.hospital}
                    onChange={(e) => handleExperienceChange(index, "hospital", e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., Mayo Clinic"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                  <input
                    type="date"
                    value={exp.from}
                    onChange={(e) => handleExperienceChange(index, "from", e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                  <input
                    type="date"
                    value={exp.to}
                    onChange={(e) => handleExperienceChange(index, "to", e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              {formData.experience.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeExperience(index)}
                  className="mt-2 text-sm text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="bg-primary text-white py-2 px-4 rounded-md hover:bg-accent transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Doctor"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddDoctorForm
