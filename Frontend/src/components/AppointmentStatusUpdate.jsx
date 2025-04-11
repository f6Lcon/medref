"use client"

import { useState } from "react"
import axios from "axios"
import { FaCheck, FaTimes, FaClock, FaNotesMedical } from "react-icons/fa"

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000"

/**
 * Component for doctors to update appointment status
 */
const AppointmentStatusUpdate = ({ appointment, onStatusUpdate }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [notes, setNotes] = useState("")
  const [showNotes, setShowNotes] = useState(false)

  const updateStatus = async (newStatus) => {
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("You must be logged in to update appointment status")
        setLoading(false)
        return
      }

      const response = await axios.put(
        `${API_URL}/api/appointments/${appointment._id}/status`,
        { status: newStatus },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      )

      // Call the callback function with the updated appointment
      if (onStatusUpdate) {
        onStatusUpdate(response.data)
      }
    } catch (err) {
      console.error("Error updating appointment status:", err)
      setError(err.response?.data?.message || "Failed to update appointment status")
    } finally {
      setLoading(false)
    }
  }

  const addNotes = async () => {
    if (!notes.trim()) {
      setError("Please enter notes before saving")
      return
    }

    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("You must be logged in to add notes")
        setLoading(false)
        return
      }

      const response = await axios.put(
        `${API_URL}/api/appointments/${appointment._id}`,
        { notes },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      )

      // Call the callback function with the updated appointment
      if (onStatusUpdate) {
        onStatusUpdate(response.data)
      }

      // Hide the notes form after successful submission
      setShowNotes(false)
      setNotes("")
    } catch (err) {
      console.error("Error adding notes:", err)
      setError(err.response?.data?.message || "Failed to add notes")
    } finally {
      setLoading(false)
    }
  }

  // Don't show update options for completed or cancelled appointments
  if (appointment.status === "completed" || appointment.status === "cancelled") {
    return (
      <div className="flex items-center space-x-2">
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            appointment.status === "completed" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="flex flex-wrap gap-2">
        {appointment.status !== "completed" && (
          <button
            onClick={() => updateStatus("completed")}
            disabled={loading}
            className="flex items-center px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 text-xs font-medium transition"
          >
            <FaCheck className="mr-1" /> Complete
          </button>
        )}

        {appointment.status !== "no-show" && (
          <button
            onClick={() => updateStatus("no-show")}
            disabled={loading}
            className="flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 text-xs font-medium transition"
          >
            <FaTimes className="mr-1" /> No-show
          </button>
        )}

        {appointment.status !== "cancelled" && (
          <button
            onClick={() => updateStatus("cancelled")}
            disabled={loading}
            className="flex items-center px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 text-xs font-medium transition"
          >
            <FaTimes className="mr-1" /> Cancel
          </button>
        )}

        {appointment.status !== "rescheduled" && (
          <button
            onClick={() => updateStatus("rescheduled")}
            disabled={loading}
            className="flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-xs font-medium transition"
          >
            <FaClock className="mr-1" /> Reschedule
          </button>
        )}

        <button
          onClick={() => setShowNotes(!showNotes)}
          className="flex items-center px-2 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-xs font-medium transition"
        >
          <FaNotesMedical className="mr-1" /> {showNotes ? "Hide Notes" : "Add Notes"}
        </button>
      </div>

      {showNotes && (
        <div className="mt-2">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter appointment notes..."
            className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            rows={3}
          ></textarea>
          <div className="flex justify-end mt-1">
            <button
              onClick={addNotes}
              disabled={loading}
              className="px-3 py-1 bg-primary text-white rounded text-xs hover:bg-accent transition"
            >
              Save Notes
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AppointmentStatusUpdate
