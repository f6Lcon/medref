"use client"

import { useState } from "react"
import axios from "axios"
import { FaCheck, FaSpinner, FaCalendarAlt, FaChevronDown, FaChevronUp } from "react-icons/fa"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

const AppointmentCompletion = ({ appointment, onSuccess }) => {
  const [formData, setFormData] = useState({
    diagnosis: "",
    treatment: "",
    prescription: "",
    followUpNeeded: false,
    followUpDate: "",
    followUpNotes: "",
    additionalNotes: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [showFollowUp, setShowFollowUp] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })

    if (name === "followUpNeeded") {
      setShowFollowUp(checked)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("You must be logged in to complete an appointment")
        setLoading(false)
        return
      }

      const response = await axios.put(`${API_URL}/api/appointments/${appointment._id}/complete`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setSuccess(true)
      setLoading(false)

      // Call the onSuccess callback with the updated appointment
      if (onSuccess) {
        onSuccess(response.data)
      }
    } catch (err) {
      console.error("Error completing appointment:", err)
      setError(err.response?.data?.message || "Failed to complete appointment. Please try again.")
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
        <div className="flex items-center justify-center mb-2">
          <div className="bg-green-100 rounded-full p-2">
            <FaCheck className="text-green-600" size={20} />
          </div>
        </div>
        <h3 className="text-lg font-medium text-green-800">Appointment Completed Successfully</h3>
        <p className="text-sm text-green-600 mt-1">
          A summary email has been sent to the patient with all the details.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-md shadow-sm p-4">
      <h3 className="text-lg font-medium text-gray-800 mb-4">Complete Appointment</h3>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-1">
              Diagnosis <span className="text-red-500">*</span>
            </label>
            <textarea
              id="diagnosis"
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
              rows="3"
              placeholder="Enter diagnosis details"
            ></textarea>
          </div>

          <div>
            <label htmlFor="treatment" className="block text-sm font-medium text-gray-700 mb-1">
              Treatment Plan <span className="text-red-500">*</span>
            </label>
            <textarea
              id="treatment"
              name="treatment"
              value={formData.treatment}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
              rows="3"
              placeholder="Enter treatment plan"
            ></textarea>
          </div>

          <div>
            <label htmlFor="prescription" className="block text-sm font-medium text-gray-700 mb-1">
              Prescription
            </label>
            <textarea
              id="prescription"
              name="prescription"
              value={formData.prescription}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
              rows="2"
              placeholder="Enter prescription details (if any)"
            ></textarea>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="followUpNeeded"
              name="followUpNeeded"
              checked={formData.followUpNeeded}
              onChange={handleChange}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="followUpNeeded" className="ml-2 block text-sm text-gray-700">
              Follow-up appointment needed
            </label>
            <button
              type="button"
              onClick={() => setShowFollowUp(!showFollowUp)}
              className="ml-auto text-gray-500 hover:text-gray-700"
            >
              {showFollowUp ? <FaChevronUp /> : <FaChevronDown />}
            </button>
          </div>

          {(showFollowUp || formData.followUpNeeded) && (
            <div className="pl-6 border-l-2 border-gray-200 space-y-4">
              <div>
                <label htmlFor="followUpDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Suggested Follow-up Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="followUpDate"
                    name="followUpDate"
                    value={formData.followUpDate}
                    onChange={handleChange}
                    className="w-full pl-10 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="followUpNotes" className="block text-sm font-medium text-gray-700 mb-1">
                  Follow-up Notes
                </label>
                <textarea
                  id="followUpNotes"
                  name="followUpNotes"
                  value={formData.followUpNotes}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  rows="2"
                  placeholder="Enter any notes for the follow-up appointment"
                ></textarea>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              id="additionalNotes"
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
              rows="2"
              placeholder="Enter any additional notes"
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white py-2 px-4 rounded-md hover:bg-accent transition flex items-center disabled:opacity-50"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" /> Processing...
                </>
              ) : (
                <>
                  <FaCheck className="mr-2" /> Complete Appointment
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default AppointmentCompletion
