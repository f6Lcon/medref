"use client"

import { useState, useEffect, useContext } from "react"
import axios from "axios"
import { FaCalendarAlt, FaClock, FaNotesMedical } from "react-icons/fa"
import LoginContext from "../context/LoginContext"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

/**
 * Component for scheduling an appointment from a referral
 */
const AppointmentFromReferral = ({ referral, onClose, onAppointmentCreated }) => {
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [duration, setDuration] = useState(30)
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const { userRole } = useContext(LoginContext)

  // Set minimum date to today
  const today = new Date().toISOString().split("T")[0]

  useEffect(() => {
    // Set default date to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setDate(tomorrow.toISOString().split("T")[0])

    // Set default time to 9:00 AM
    setTime("09:00")

    // Set default notes from referral
    if (referral?.notes) {
      setNotes(referral.notes)
    }
  }, [referral])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("You must be logged in to schedule an appointment")
        setLoading(false)
        return
      }

      // Check if user is a doctor
      if (userRole !== "doctor" && userRole !== "admin") {
        setError("Only doctors can schedule appointments from referrals")
        setLoading(false)
        return
      }

      const response = await axios.post(
        `${API_URL}/api/appointments/from-referral`,
        {
          referralId: referral._id,
          date,
          time,
          duration,
          notes,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      )

      console.log("Appointment created:", response.data)
      setSuccess(true)

      // Call the callback function with the created appointment
      if (onAppointmentCreated) {
        onAppointmentCreated(response.data)
      }

      // Close the modal after a short delay
      setTimeout(() => {
        if (onClose) onClose()
      }, 2000)
    } catch (err) {
      console.error("Error creating appointment:", err.response?.data || err.message)
      setError(err.response?.data?.message || "Failed to create appointment")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-primary">Schedule Appointment from Referral</h2>

      {error && <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">{error}</div>}

      {success ? (
        <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">Appointment scheduled successfully!</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4 p-2 bg-blue-50 rounded">
            <h3 className="font-medium text-blue-800">Referral Details</h3>
            <p className="text-sm">
              <strong>Patient:</strong> {referral?.patient?.user?.name || "Unknown"}
            </p>
            <p className="text-sm">
              <strong>Reason:</strong> {referral?.reason || "Not specified"}
            </p>
            <p className="text-sm">
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
                {referral?.urgency?.charAt(0).toUpperCase() + referral?.urgency?.slice(1) || "Medium"}
              </span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaCalendarAlt className="inline mr-2" />
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={today}
              required
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaClock className="inline mr-2" />
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaClock className="inline mr-2" />
              Duration (minutes)
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaNotesMedical className="inline mr-2" />
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this appointment..."
              rows={3}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            ></textarea>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-accent transition"
            >
              {loading ? "Scheduling..." : "Schedule Appointment"}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default AppointmentFromReferral
