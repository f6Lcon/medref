"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { FaCalendarAlt, FaClock, FaHospital, FaUserMd, FaClipboardList } from "react-icons/fa"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

const BookAppointmentForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    doctor: "",
    hospital: "",
    date: "",
    time: "",
    type: "regular",
    reason: "",
    notes: "",
  })
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
        setError("Failed to load doctors and hospitals. Please try again.")
      }
    }

    fetchData()
  }, [navigate])

  // Filter doctors based on selected hospital
  useEffect(() => {
    if (formData.hospital) {
      const doctorsInHospital = doctors.filter((doctor) => doctor.hospital && doctor.hospital._id === formData.hospital)
      setFilteredDoctors(doctorsInHospital)

      // Clear selected doctor if not in this hospital
      if (formData.doctor && !doctorsInHospital.some((doc) => doc._id === formData.doctor)) {
        setFormData((prev) => ({ ...prev, doctor: "" }))
      }
    } else {
      setFilteredDoctors([])
    }
  }, [formData.hospital, doctors, formData.doctor])

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
      if (!formData.doctor || !formData.hospital || !formData.date || !formData.time || !formData.reason) {
        setError("Please fill in all required fields")
        setLoading(false)
        return
      }

      // Format the appointment data
      const appointmentData = {
        doctor: formData.doctor,
        hospital: formData.hospital,
        date: formData.date,
        time: formData.time,
        type: formData.type,
        reason: formData.reason,
        notes: formData.notes || "",
      }

      // Submit the appointment
      const response = await axios.post(`${API_URL}/api/appointments`, appointmentData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("Appointment created:", response.data)
      setSuccess(true)

      // Reset form
      setFormData({
        doctor: "",
        hospital: "",
        date: "",
        time: "",
        type: "regular",
        reason: "",
        notes: "",
      })

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(response.data)
      }
    } catch (err) {
      console.error("Error creating appointment:", err)
      setError(err.response?.data?.message || "Failed to book appointment. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Get tomorrow's date in YYYY-MM-DD format for min date attribute
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split("T")[0]

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Book an Appointment</h2>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Appointment booked successfully! You will receive a confirmation shortly.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="hospital" className="block text-sm font-medium text-gray-700 mb-1">
              <FaHospital className="inline mr-2" /> Select Hospital*
            </label>
            <select
              id="hospital"
              name="hospital"
              value={formData.hospital}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-accent"
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
            <label htmlFor="doctor" className="block text-sm font-medium text-gray-700 mb-1">
              <FaUserMd className="inline mr-2" /> Select Doctor*
            </label>
            <select
              id="doctor"
              name="doctor"
              value={formData.doctor}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-accent"
              required
              disabled={!formData.hospital}
            >
              <option value="">
                {!formData.hospital
                  ? "Please select a hospital first"
                  : filteredDoctors.length === 0
                    ? "No doctors available at this hospital"
                    : "Select a doctor"}
              </option>
              {filteredDoctors.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  Dr. {doctor.user?.name || "Unknown"} - {doctor.specialization}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              <FaCalendarAlt className="inline mr-2" /> Appointment Date*
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={minDate}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
          </div>

          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
              <FaClock className="inline mr-2" /> Appointment Time*
            </label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              <FaClipboardList className="inline mr-2" /> Appointment Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="regular">Regular Checkup</option>
              <option value="follow-up">Follow-up</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
            Reason for Visit*
          </label>
          <textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="Please describe your symptoms or reason for the appointment"
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
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="Any additional information you'd like to provide"
          ></textarea>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-accent text-white py-2 px-6 rounded-md hover:bg-primary hover:text-accent transition disabled:opacity-50"
            disabled={loading || !formData.hospital || !formData.doctor}
          >
            {loading ? "Booking..." : "Book Appointment"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default BookAppointmentForm
