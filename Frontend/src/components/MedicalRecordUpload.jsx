"use client"

import { useState } from "react"
import axios from "axios"
import { FaUpload, FaFile, FaFilePdf, FaFileImage, FaFileAlt, FaTrash } from "react-icons/fa"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

const MedicalRecordUpload = ({ patientId, onUploadSuccess }) => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [preview, setPreview] = useState(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return

    setFile(selectedFile)

    // Create preview for images
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target.result)
      }
      reader.readAsDataURL(selectedFile)
    } else {
      setPreview(null)
    }
  }

  const getFileIcon = () => {
    if (!file) return <FaFile size={24} />

    const fileType = file.type
    if (fileType.includes("pdf")) return <FaFilePdf size={24} className="text-red-500" />
    if (fileType.includes("image")) return <FaFileImage size={24} className="text-red-500" />
    if (fileType.includes("image")) return <FaFileImage size={24} className="text-blue-500" />
    return <FaFileAlt size={24} className="text-gray-500" />
  }

  const clearFile = () => {
    setFile(null)
    setPreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file || !title.trim()) {
      setError("Please provide a title and select a file")
      return
    }

    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("You must be logged in to upload medical records")
        setLoading(false)
        return
      }

      // Create form data
      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", description)
      formData.append("file", file)
      formData.append("patientId", patientId)

      const response = await axios.post(`${API_URL}/api/medical-records/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })

      // Reset form
      setTitle("")
      setDescription("")
      setFile(null)
      setPreview(null)

      // Call success callback
      if (onUploadSuccess) {
        onUploadSuccess(response.data)
      }
    } catch (err) {
      console.error("Error uploading medical record:", err)
      setError(err.response?.data?.message || "Failed to upload medical record")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Medical Record</h2>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title*
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="e.g., Blood Test Results"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="Brief description of the medical record"
            rows={3}
          ></textarea>
        </div>

        <div>
          <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
            File*
          </label>
          {!file ? (
            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
              <input
                type="file"
                id="file"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              <label
                htmlFor="file"
                className="flex flex-col items-center justify-center cursor-pointer text-gray-500 hover:text-accent"
              >
                <FaUpload size={24} className="mb-2" />
                <span className="text-sm">Click to upload or drag and drop</span>
                <span className="text-xs mt-1">PDF, JPG, PNG, DOC up to 10MB</span>
              </label>
            </div>
          ) : (
            <div className="border rounded-md p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getFileIcon()}
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={clearFile}
                  className="text-red-500 hover:text-red-700 transition"
                  title="Remove file"
                >
                  <FaTrash size={16} />
                </button>
              </div>
              {preview && (
                <div className="mt-3">
                  <img src={preview || "/placeholder.svg"} alt="Preview" className="max-h-40 rounded border" />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !file}
            className="bg-accent text-white py-2 px-4 rounded-md hover:bg-primary transition disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Upload Record"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default MedicalRecordUpload
