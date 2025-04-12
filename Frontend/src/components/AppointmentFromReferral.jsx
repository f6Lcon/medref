"use client"

import { useState } from "react"
import axios from "axios"
import { FaCalendarAlt, FaClock, FaClipboardList } from "react-icons/fa"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

const AppointmentFromReferral = ({ referral, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    duration: 30,
    notes: referral?.notes || "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Get tomorrow's date in YYYY-MM-DD format for min date attribute
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split("T")[0]

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
        setError("You must be logged in to create an appointment")
        setLoading(false)
        return
      }

      // Validate form data
      if (!formData.date || !formData.time) {
        setError("Please fill in all required fields")
        setLoading(false)
        return
      }

      // Submit the appointment
      const response = await axios.post(`${API_URL}/api/referrals/${referral._id}/appointment`, formData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      // Call success callback
      if (onSuccess) {
        onSuccess(response.data)
      }
    } catch (err) {
      console.error("Error creating appointment from referral:", err)
      setError(err.response?.data?.message || "Failed to create appointment. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Schedule Appointment from Referral</h2>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="mb-6 p-4 bg-blue-50 rounded-md">
        <h3 className="text-md font-medium text-gray-800 mb-2">Referral Information</h3>
        <p className="text-sm text-gray-600">
          <strong>Patient:</strong> {referral?.patient?.user?.name || "Unknown Patient"}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Referring Doctor:</strong> Dr. {referral?.referringDoctor?.user?.name || "Unknown"}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Reason:</strong> {referral?.reason}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Urgency:</strong>{" "}
          <span
            className={`${
              referral?.urgency === "low"
                ? "text-green-600"
                : referral?.urgency === "medium"
                  ? "text-yellow-600"
                  : referral?.urgency === "high"
                    ? "text-orange-600"
                    : "text-red-600"
            }`}
          >
            {referral?.urgency?.charAt(0).toUpperCase() + referral?.urgency?.slice(1)}
          </span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
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
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
            Duration (minutes)
          </label>
          <select
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
            <option value="60">60 minutes</option>
          </select>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            <FaClipboardList className="inline mr-2" /> Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Any additional notes for this appointment"
          ></textarea>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-primary text-white py-2 px-4 rounded-md hover:bg-accent transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Scheduling..." : "Schedule Appointment"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AppointmentFromReferral
