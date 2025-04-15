"use client"

import { useState, useEffect } from "react"
import { FaTimes, FaSave, FaCalendarAlt, FaClock, FaHospital, FaUserMd } from "react-icons/fa"
import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

const AppointmentEditModal = ({ appointment, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    doctor: appointment?.doctor?._id || "",
    hospital: appointment?.hospital?._id || "",
    date: appointment?.date ? new Date(appointment.date).toISOString().split("T")[0] : "",
    time: appointment?.time || "",
    duration: appointment?.duration || 30,
    type: appointment?.type || "consultation",
    reason: appointment?.reason || "",
    notes: appointment?.notes || "",
    status: appointment?.status || "scheduled",
  })
  const [doctors, setDoctors] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return

        // Fetch doctors
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
  }, [])

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
        setError("You must be logged in to update appointment information")
        setLoading(false)
        return
      }

      console.log("Updating appointment with ID:", appointment._id)
      console.log("Form data:", formData)

      const response = await axios.put(`${API_URL}/api/appointments/${appointment._id}`, formData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("Update response:", response.data)

      // Call the onSave callback with the updated appointment
      onSave({
        ...appointment,
        ...response.data,
      })
    } catch (err) {
      console.error("Error updating appointment:", err)
      setError(
        err.response?.status === 404
          ? "Appointment not found. The API endpoint may be incorrect."
          : err.response?.data?.message || "Failed to update appointment. Please try again.",
      )
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Edit Appointment</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes size={20} />
          </button>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="doctor" className="block text-sm font-medium text-gray-700 mb-1">
                <FaUserMd className="inline mr-2" /> Doctor
              </label>
              <select
                id="doctor"
                name="doctor"
                value={formData.doctor}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select a doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    Dr. {doctor.user?.name || doctor.name || "Unknown"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="hospital" className="block text-sm font-medium text-gray-700 mb-1">
                <FaHospital className="inline mr-2" /> Hospital
              </label>
              <select
                id="hospital"
                name="hospital"
                value={formData.hospital}
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
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                <FaCalendarAlt className="inline mr-2" /> Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                <FaClock className="inline mr-2" /> Time
              </label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min="15"
                step="15"
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Appointment Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="consultation">Consultation</option>
                <option value="follow-up">Follow-up</option>
                <option value="procedure">Procedure</option>
                <option value="emergency">Emergency</option>
                <option value="routine-checkup">Routine Checkup</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No Show</option>
                <option value="rescheduled">Rescheduled</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Visit
            </label>
            <input
              type="text"
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
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
              rows="3"
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary text-white py-2 px-4 rounded-md hover:bg-accent transition flex items-center"
              disabled={loading}
            >
              <FaSave className="mr-2" />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AppointmentEditModal
