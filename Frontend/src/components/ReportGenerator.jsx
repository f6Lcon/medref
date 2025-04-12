"use client"

import { useState } from "react"
import { FaFilePdf, FaFileExcel, FaFileCsv, FaFileAlt, FaDownload, FaCalendarAlt } from "react-icons/fa"
import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

const ReportGenerator = () => {
  const [reportType, setReportType] = useState("appointments")
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [reportData, setReportData] = useState(null)
  const [format, setFormat] = useState("pdf")

  const handleDateChange = (e) => {
    const { name, value } = e.target
    setDateRange({
      ...dateRange,
      [name]: value,
    })
  }

  const generateReport = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      setError("Please select both start and end dates")
      return
    }

    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("You must be logged in to generate reports")
        setLoading(false)
        return
      }

      // In a real application, you would make an API call to generate the report
      // For now, we'll simulate this with a timeout and mock data
      const response = await axios.get(`${API_URL}/api/${reportType}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
      })

      // Process the data for the report
      const data = response.data
      setReportData({
        type: reportType,
        dateRange,
        data,
        generatedAt: new Date().toISOString(),
      })
    } catch (err) {
      console.error("Error generating report:", err)
      setError(err.response?.data?.message || "Failed to generate report. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = () => {
    if (!reportData) {
      setError("Please generate a report first")
      return
    }

    // In a real application, you would make an API call to download the report in the selected format
    // For now, we'll simulate this by creating a JSON file

    const reportJson = JSON.stringify(reportData, null, 2)
    const blob = new Blob([reportJson], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${reportType}_report_${format}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Generate Reports</h2>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="appointments">Appointments Report</option>
            <option value="referrals">Referrals Report</option>
            <option value="doctors">Doctors Report</option>
            <option value="patients">Patients Report</option>
            <option value="hospitals">Hospitals Report</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="format"
                value="pdf"
                checked={format === "pdf"}
                onChange={() => setFormat("pdf")}
                className="mr-2"
              />
              <FaFilePdf className="text-red-500 mr-1" /> PDF
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="format"
                value="excel"
                checked={format === "excel"}
                onChange={() => setFormat("excel")}
                className="mr-2"
              />
              <FaFileExcel className="text-green-500 mr-1" /> Excel
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="format"
                value="csv"
                checked={format === "csv"}
                onChange={() => setFormat("csv")}
                className="mr-2"
              />
              <FaFileCsv className="text-blue-500 mr-1" /> CSV
            </label>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FaCalendarAlt className="inline mr-2" /> Date Range
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={generateReport}
          disabled={loading}
          className="bg-primary text-white py-2 px-4 rounded-md hover:bg-accent transition disabled:opacity-50 flex items-center"
        >
          <FaFileAlt className="mr-2" />
          {loading ? "Generating..." : "Generate Report"}
        </button>

        <button
          onClick={downloadReport}
          disabled={!reportData || loading}
          className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition disabled:opacity-50 flex items-center"
        >
          <FaDownload className="mr-2" />
          Download Report
        </button>
      </div>

      {reportData && (
        <div className="mt-6 p-4 border rounded-md bg-gray-50">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Report Preview</h3>
          <div className="text-sm text-gray-600">
            <p>
              <strong>Type:</strong> {reportData.type.charAt(0).toUpperCase() + reportData.type.slice(1)} Report
            </p>
            <p>
              <strong>Date Range:</strong> {new Date(reportData.dateRange.startDate).toLocaleDateString()} to{" "}
              {new Date(reportData.dateRange.endDate).toLocaleDateString()}
            </p>
            <p>
              <strong>Generated:</strong> {new Date(reportData.generatedAt).toLocaleString()}
            </p>
            <p>
              <strong>Total Records:</strong> {reportData.data.length}
            </p>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Click the Download button to save this report in {format.toUpperCase()} format.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportGenerator
