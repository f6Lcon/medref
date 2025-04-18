"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { FaUserCircle, FaHospital, FaExclamationTriangle, FaClipboardList, FaUserMd } from "react-icons/fa"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

const CreateReferralForm = ({ onSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    patient: "",
    referredToDoctor: "",
    referredToHospital: "",
    reason: "",
    notes: "",
    urgency: "medium",
  })
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [filteredDoctors, setFilteredDoctors] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          navigate("/login")
          return
        }

        // Fetch patients
        const patientsResponse = await axios.get(`${API_URL}/api/patients`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setPatients(patientsResponse.data)

        // Fetch all doctors
        const doctorsResponse = await axios.get(`${API_URL}/api/doctors`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setDoctors(doctorsResponse.data)

        // Fetch hospitals
        const hospitalsResponse = await axios.get(`${API_URL}/api/hospitals`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setHospitals(hospitalsResponse.data)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load necessary data. Please try again.")
      }
    }

    fetchData()
  }, [navigate])

  // Filter doctors based on selected hospital
  useEffect(() => {
    if (formData.referredToHospital) {
      const doctorsInHospital = doctors.filter(
        (doctor) => doctor.hospital && doctor.hospital._id === formData.referredToHospital,
      )
      setFilteredDoctors(doctorsInHospital)

      // Clear selected doctor if not in this hospital
      if (formData.referredToDoctor && !doctorsInHospital.some((doc) => doc._id === formData.referredToDoctor)) {
        setFormData((prev) => ({ ...prev, referredToDoctor: "" }))
      }
    } else {
      setFilteredDoctors([])
    }
  }, [formData.referredToHospital, doctors, formData.referredToDoctor])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        navigate("/login")
        return
      }

      // Validate form data
      if (!formData.patient || !formData.referredToHospital || !formData.reason) {
        setError("Please fill in all required fields")
        setLoading(false)
        return
      }

      // Format the referral data
      const referralData = {
        patient: formData.patient,
        referredToDoctor: formData.referredToDoctor || undefined, // Only include if selected
        referredToHospital: formData.referredToHospital,
        reason: formData.reason,
        notes: formData.notes || "",
        urgency: formData.urgency,
      }

      console.log("Submitting referral data:", referralData)

      // Submit the referral
      const response = await axios.post(`${API_URL}/api/referrals`, referralData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("Referral created successfully:", response.data)
      setSuccess(true)

      // Reset form
      setFormData({
        patient: "",
        referredToDoctor: "",
        referredToHospital: "",
        reason: "",
        notes: "",
        urgency: "medium",
      })

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(response.data)
      }
    } catch (err) {
      console.error("Error creating referral:", err)
      setError(err.response?.data?.message || "Failed to create referral. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Create Patient Referral</h2>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Referral created successfully! The patient will be notified.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="patient" className="block text-sm font-medium text-gray-700 mb-1">
              <FaUserCircle className="inline mr-2" /> Select Patient*
            </label>
            <select
              id="patient"
              name="patient"
              value={formData.patient}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Select a patient</option>
              {patients.map((patient) => (
                <option key={patient._id} value={patient._id}>
                  {patient.user?.name || "Unknown Patient"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="referredToHospital" className="block text-sm font-medium text-gray-700 mb-1">
              <FaHospital className="inline mr-2" /> Refer To Hospital*
            </label>
            <select
              id="referredToHospital"
              name="referredToHospital"
              value={formData.referredToHospital}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
              required
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
            <label htmlFor="referredToDoctor" className="block text-sm font-medium text-gray-700 mb-1">
              <FaUserMd className="inline mr-2" /> Refer To Doctor (Optional)
            </label>
            <select
              id="referredToDoctor"
              name="referredToDoctor"
              value={formData.referredToDoctor}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={!formData.referredToHospital}
            >
              <option value="">
                {!formData.referredToHospital
                  ? "Please select a hospital first"
                  : filteredDoctors.length === 0
                    ? "No doctors available at this hospital"
                    : "Select a doctor (optional)"}
              </option>
              {filteredDoctors.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  Dr. {doctor.user?.name || "Unknown"} - {doctor.specialization}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-1">
              <FaExclamationTriangle className="inline mr-2" /> Urgency Level
            </label>
            <select
              id="urgency"
              name="urgency"
              value={formData.urgency}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
            <FaClipboardList className="inline mr-2" /> Reason for Referral*
          </label>
          <textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Please describe the reason for this referral"
            required
          ></textarea>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={2}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Any additional notes or information for the receiving doctor"
          ></textarea>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-primary text-white py-2 px-6 rounded-md hover:bg-accent transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Referral"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateReferralForm
