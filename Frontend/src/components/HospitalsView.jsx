"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaGlobe, FaBuilding } from "react-icons/fa"
import HospitalMap from "./HospitalMap"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

const HospitalsView = () => {
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedHospital, setSelectedHospital] = useState(null)
  const [viewMode, setViewMode] = useState("list") // "list" or "map"

  useEffect(() => {
    fetchHospitals()
  }, [])

  const fetchHospitals = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/api/hospitals`)
      setHospitals(response.data)
    } catch (err) {
      console.error("Error fetching hospitals:", err)
      setError("Failed to load hospitals. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleSelectHospital = (hospital) => {
    setSelectedHospital(hospital)
    // If in map view, the map component will handle centering
    // If in list view, scroll to the hospital in the list
    if (viewMode === "list") {
      const element = document.getElementById(`hospital-${hospital._id}`)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-2">Loading hospitals...</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Hospitals</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 rounded-md ${
              viewMode === "list" ? "bg-primary text-white" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            } transition`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`px-4 py-2 rounded-md ${
              viewMode === "map" ? "bg-primary text-white" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            } transition`}
          >
            Map View
          </button>
        </div>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {hospitals.length === 0 ? (
        <div className="text-center py-8">
          <FaBuilding className="mx-auto text-4xl text-gray-400 mb-2" />
          <p className="text-gray-500">No hospitals found.</p>
        </div>
      ) : viewMode === "map" ? (
        <HospitalMap selectedHospital={selectedHospital} onSelectHospital={handleSelectHospital} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hospitals.map((hospital) => (
            <div
              key={hospital._id}
              id={`hospital-${hospital._id}`}
              className={`border rounded-lg overflow-hidden ${
                selectedHospital?._id === hospital._id ? "border-primary ring-2 ring-primary/20" : "border-gray-200"
              } hover:shadow-md transition`}
              onClick={() => handleSelectHospital(hospital)}
            >
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800">{hospital.name}</h3>
                <div className="mt-2 space-y-2">
                  <p className="flex items-start">
                    <FaMapMarkerAlt className="text-gray-500 mr-2 mt-1 flex-shrink-0" />
                    <span>
                      {hospital.address?.street}, {hospital.address?.city}, {hospital.address?.state}{" "}
                      {hospital.address?.zipCode}, {hospital.address?.country}
                    </span>
                  </p>
                  <p className="flex items-center">
                    <FaPhone className="text-gray-500 mr-2 flex-shrink-0" />
                    <span>{hospital.contactInfo?.phone}</span>
                  </p>
                  {hospital.contactInfo?.email && (
                    <p className="flex items-center">
                      <FaEnvelope className="text-gray-500 mr-2 flex-shrink-0" />
                      <span>{hospital.contactInfo.email}</span>
                    </p>
                  )}
                  {hospital.contactInfo?.website && (
                    <p className="flex items-center">
                      <FaGlobe className="text-gray-500 mr-2 flex-shrink-0" />
                      <a
                        href={
                          hospital.contactInfo.website.startsWith("http")
                            ? hospital.contactInfo.website
                            : `https://${hospital.contactInfo.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {hospital.contactInfo.website.replace(/^https?:\/\//, "")}
                      </a>
                    </p>
                  )}
                </div>

                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-1">Operating Hours</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600">Weekdays:</p>
                      <p>
                        {hospital.operatingHours?.weekdays?.open && hospital.operatingHours?.weekdays?.close
                          ? `${hospital.operatingHours.weekdays.open} - ${hospital.operatingHours.weekdays.close}`
                          : "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Weekends:</p>
                      <p>
                        {hospital.operatingHours?.weekends?.open && hospital.operatingHours?.weekends?.close
                          ? `${hospital.operatingHours.weekends.open} - ${hospital.operatingHours.weekends.close}`
                          : "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                {(hospital.departments?.length > 0 || hospital.facilities?.length > 0) && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    {hospital.departments?.length > 0 && (
                      <div className="mb-2">
                        <h4 className="font-medium text-gray-700 mb-1">Departments</h4>
                        <div className="flex flex-wrap gap-1">
                          {hospital.departments.map((dept, index) => (
                            <span
                              key={index}
                              className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                            >
                              {dept}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {hospital.facilities?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">Facilities</h4>
                        <div className="flex flex-wrap gap-1">
                          {hospital.facilities.map((facility, index) => (
                            <span
                              key={index}
                              className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                            >
                              {facility}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default HospitalsView
