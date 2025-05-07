"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { FaCheck, FaSpinner, FaTimes, FaClipboardCheck } from "react-icons/fa"
import AppointmentCompletion from "./AppointmentCompletion"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

const AppointmentStatusUpdate = ({ appointmentId, onStatusUpdate }) => {
  const [appointment, setAppointment] = useState(null)
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [showCompletionForm, setShowCompletionForm] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchAppointment = async () => {
      // Don't attempt to fetch if appointmentId is undefined
      if (!appointmentId) {
        setError("Today")
        setLoading(false)
        return
      }

      try {
        const token = localStorage.getItem("token")
        if (!token) {
          navigate("/login")
          return
        }

        const response = await axios.get(`${API_URL}/api/appointments/${appointmentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        setAppointment(response.data)
        setStatus(response.data.status)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching appointment:", err)
        setError("Failed to load appointment details")
        setLoading(false)
      }
    }

    fetchAppointment()
  }, [appointmentId, navigate])

  const handleStatusChange = (e) => {
    setStatus(e.target.value)
  }

  const handleStatusUpdate = async (e) => {
    e.preventDefault()

    // If the status is "completed", show the completion form instead of updating directly
    if (status === "completed") {
      setShowCompletionForm(true)
      return
    }

    setUpdating(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        navigate("/login")
        return
      }

      await axios.put(
        `${API_URL}/api/appointments/${appointmentId}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      setSuccess(true)
      setUpdating(false)

      // Call the onStatusUpdate callback if provided
      if (onStatusUpdate) {
        onStatusUpdate(status)
      }

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err) {
      console.error("Error updating appointment status:", err)
      setError(err.response?.data?.message || "Failed to update appointment status")
      setUpdating(false)
    }
  }

  const handleCompletionSuccess = (updatedAppointment) => {
    setAppointment(updatedAppointment)
    setStatus("completed")
    setShowCompletionForm(false)
    setSuccess(true)

    // Call the onStatusUpdate callback if provided
    if (onStatusUpdate) {
      onStatusUpdate("completed")
    }

    // Reset success message after 3 seconds
    setTimeout(() => {
      setSuccess(false)
    }, 3000)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <FaSpinner className="animate-spin text-primary" size={24} />
      </div>
    )
  }

  // Show error state if there's no appointment after loading
  if (!appointment) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error || "Could not load appointment details"}
      </div>
    )
  }

  if (showCompletionForm) {
    return (
      <div className="bg-white rounded-md shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800">Complete Appointment</h3>
          <button onClick={() => setShowCompletionForm(false)} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>
        <AppointmentCompletion appointment={appointment} onSuccess={handleCompletionSuccess} />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-md shadow p-4">
      <h3 className="text-lg font-medium text-gray-800 mb-4">Update Appointment Status</h3>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          Appointment status updated successfully!
        </div>
      )}

      <form onSubmit={handleStatusUpdate}>
        <div className="mb-4">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={status}
            onChange={handleStatusChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rescheduled">Rescheduled</option>
            <option value="noshow">No Show</option>
          </select>
        </div>

        <div className="flex justify-end">
          {status === "completed" ? (
            <button
              type="submit"
              className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition flex items-center"
            >
              <FaClipboardCheck className="mr-2" /> Complete with Details
            </button>
          ) : (
            <button
              type="submit"
              disabled={updating || (appointment && status === appointment.status)}
              className="bg-primary text-white py-2 px-4 rounded-md hover:bg-accent transition flex items-center disabled:opacity-50"
            >
              {updating ? (
                <>
                  <FaSpinner className="animate-spin mr-2" /> Updating...
                </>
              ) : (
                <>
                  <FaCheck className="mr-2" /> Update Status
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default AppointmentStatusUpdate