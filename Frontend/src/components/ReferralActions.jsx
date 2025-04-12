"use client"

import { useState } from "react"
import axios from "axios"
import { FaCheck, FaTimes, FaCalendarPlus, FaNotesMedical } from "react-icons/fa"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

/**
 * Component for doctors to accept, reject, or schedule appointments from referrals
 */
const ReferralActions = ({ referral, onReferralUpdate, onScheduleAppointment }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [notes, setNotes] = useState("")
  const [showNotes, setShowNotes] = useState(false)

  // Update the handleReferralUpdate function to properly update the UI
  const updateStatus = async (newStatus) => {
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("You must be logged in to update referral status")
        setLoading(false)
        return
      }

      console.log(`Updating referral ${referral._id} status to ${newStatus}`)

      const response = await axios.put(
        `${API_URL}/api/referrals/${referral._id}/status`,
        { status: newStatus },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      )

      console.log("Referral status updated:", response.data)

      // Call the callback function with the updated referral
      if (onReferralUpdate) {
        onReferralUpdate(response.data)
      }
    } catch (err) {
      console.error("Error updating referral status:", err)
      setError(err.response?.data?.message || "Failed to update referral status")
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

      // Assuming there's an endpoint to update referral notes
      const response = await axios.put(
        `${API_URL}/api/referrals/${referral._id}`,
        { notes },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      )

      // Call the callback function with the updated referral
      if (onReferralUpdate) {
        onReferralUpdate(response.data)
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

  // Don't show action buttons for completed, accepted with appointment, or rejected referrals
  if (
    referral.status === "completed" ||
    (referral.status === "accepted" && referral.appointmentCreated) ||
    referral.status === "rejected"
  ) {
    return (
      <div className="flex items-center space-x-2">
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            referral.status === "completed"
              ? "bg-blue-100 text-blue-800"
              : referral.status === "accepted"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
          }`}
        >
          {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
          {referral.status === "accepted" && referral.appointmentCreated && " (Appointment Created)"}
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="flex flex-wrap gap-2">
        {referral.status === "pending" && (
          <>
            <button
              onClick={() => updateStatus("accepted")}
              disabled={loading}
              className="flex items-center px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 text-xs font-medium transition"
            >
              <FaCheck className="mr-1" /> Accept
            </button>

            <button
              onClick={() => updateStatus("rejected")}
              disabled={loading}
              className="flex items-center px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 text-xs font-medium transition"
            >
              <FaTimes className="mr-1" /> Reject
            </button>
          </>
        )}

        {referral.status === "accepted" && !referral.appointmentCreated && (
          <button
            onClick={() => onScheduleAppointment && onScheduleAppointment(referral)}
            disabled={loading}
            className="flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-xs font-medium transition"
          >
            <FaCalendarPlus className="mr-1" /> Schedule Appointment
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
            placeholder="Enter referral notes..."
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

export default ReferralActions
