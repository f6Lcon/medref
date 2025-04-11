"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { FaFilePdf, FaFileImage, FaFileAlt, FaDownload, FaEye, FaTrash, FaCalendarAlt, FaUser } from "react-icons/fa"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

const MedicalRecordsList = ({ patientId, isDoctor = false }) => {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true)
      setError("")

      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setError("You must be logged in to view medical records")
          setLoading(false)
          return
        }

        const response = await axios.get(`${API_URL}/api/medical-records/patient/${patientId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setRecords(response.data)
      } catch (err) {
        console.error("Error fetching medical records:", err)
        setError(err.response?.data?.message || "Failed to load medical records")
      } finally {
        setLoading(false)
      }
    }

    if (patientId) {
      fetchRecords()
    }
  }, [patientId])

  const getFileIcon = (fileUrl) => {
    if (!fileUrl) return <FaFileAlt size={20} className="text-gray-500" />

    if (fileUrl.endsWith(".pdf")) return <FaFilePdf size={20} className="text-red-500" />
    if (/\.(jpg|jpeg|png|gif)$/i.test(fileUrl)) return <FaFileImage size={20} className="text-blue-500" />
    return <FaFileAlt size={20} className="text-gray-500" />
  }

  const handleDownload = async (record) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("You must be logged in to download medical records")
        return
      }

      const response = await axios.get(`${API_URL}/api/medical-records/download/${record._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      })

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", record.title + getFileExtension(record.fileUrl))
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      console.error("Error downloading medical record:", err)
      setError("Failed to download medical record")
    }
  }

  const getFileExtension = (fileUrl) => {
    if (!fileUrl) return ""
    const parts = fileUrl.split(".")
    return parts.length > 1 ? "." + parts[parts.length - 1] : ""
  }

  const handleDelete = async (recordId) => {
    if (!window.confirm("Are you sure you want to delete this medical record? This action cannot be undone.")) {
      return
    }

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("You must be logged in to delete medical records")
        return
      }

      await axios.delete(`${API_URL}/api/medical-records/${recordId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      // Remove the deleted record from the list
      setRecords(records.filter((record) => record._id !== recordId))
    } catch (err) {
      console.error("Error deleting medical record:", err)
      setError(err.response?.data?.message || "Failed to delete medical record")
    }
  }

  const handlePreview = (record) => {
    setSelectedRecord(record)
    setShowPreview(true)
  }

  const closePreview = () => {
    setShowPreview(false)
    setSelectedRecord(null)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Medical Records</h2>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {loading ? (
        <div className="text-center py-4">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading medical records...</p>
        </div>
      ) : records.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No medical records found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  File
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Title
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                {isDoctor && (
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Uploaded By
                  </th>
                )}
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.map((record) => (
                <tr key={record._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getFileIcon(record.fileUrl)}
                      <span className="ml-2 text-xs text-gray-500">
                        {record.fileSize ? `${(record.fileSize / 1024 / 1024).toFixed(2)} MB` : ""}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{record.title}</div>
                    {record.description && <div className="text-sm text-gray-500">{record.description}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <FaCalendarAlt className="mr-1" size={12} />
                      {formatDate(record.uploadDate)}
                    </div>
                  </td>
                  {isDoctor && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <FaUser className="mr-1" size={12} />
                        {record.uploadedBy?.name || "Unknown"}
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handlePreview(record)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="Preview"
                    >
                      <FaEye size={16} />
                    </button>
                    <button
                      onClick={() => handleDownload(record)}
                      className="text-green-600 hover:text-green-900 mr-3"
                      title="Download"
                    >
                      <FaDownload size={16} />
                    </button>
                    {!isDoctor && (
                      <button
                        onClick={() => handleDelete(record._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <FaTrash size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">{selectedRecord.title}</h3>
              <button onClick={closePreview} className="text-gray-500 hover:text-gray-700">
                &times;
              </button>
            </div>
            <div className="p-4 overflow-auto" style={{ maxHeight: "calc(90vh - 8rem)" }}>
              {selectedRecord.fileUrl && /\.(jpg|jpeg|png|gif)$/i.test(selectedRecord.fileUrl) ? (
                <img
                  src={selectedRecord.fileUrl || "/placeholder.svg"}
                  alt={selectedRecord.title}
                  className="max-w-full h-auto mx-auto"
                />
              ) : selectedRecord.fileUrl && selectedRecord.fileUrl.endsWith(".pdf") ? (
                <div className="text-center">
                  <p className="mb-4">PDF preview not available. Please download the file to view it.</p>
                  <button
                    onClick={() => handleDownload(selectedRecord)}
                    className="bg-accent text-white py-2 px-4 rounded-md hover:bg-primary transition"
                  >
                    <FaDownload className="inline mr-2" /> Download PDF
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="mb-4">Preview not available for this file type. Please download the file to view it.</p>
                  <button
                    onClick={() => handleDownload(selectedRecord)}
                    className="bg-accent text-white py-2 px-4 rounded-md hover:bg-primary transition"
                  >
                    <FaDownload className="inline mr-2" /> Download File
                  </button>
                </div>
              )}

              {selectedRecord.description && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Description:</h4>
                  <p className="text-sm text-gray-600">{selectedRecord.description}</p>
                </div>
              )}

              <div className="mt-4 text-sm text-gray-500">
                <p>
                  <strong>Uploaded on:</strong> {formatDate(selectedRecord.uploadDate)}
                </p>
                {selectedRecord.uploadedBy && (
                  <p>
                    <strong>Uploaded by:</strong> {selectedRecord.uploadedBy.name}
                  </p>
                )}
              </div>
            </div>
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={closePreview}
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition mr-2"
              >
                Close
              </button>
              <button
                onClick={() => handleDownload(selectedRecord)}
                className="bg-accent text-white py-2 px-4 rounded-md hover:bg-primary transition"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MedicalRecordsList
