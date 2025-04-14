"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { FaHospital, FaPhone, FaEnvelope, FaMapMarkerAlt, FaUserMd, FaSpinner } from "react-icons/fa"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

const Hospitals = () => {
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [expandedHospital, setExpandedHospital] = useState(null)
  const [hospitalDoctors, setHospitalDoctors] = useState({})
  const [loadingDoctors, setLoadingDoctors] = useState({})

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${API_URL}/api/hospitals`)
        setHospitals(response.data)
      } catch (err) {
        console.error("Error fetching hospitals:", err)
        setError("Failed to load hospitals. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchHospitals()
  }, [])

  const fetchDoctorsForHospital = async (hospitalId) => {
    if (hospitalDoctors[hospitalId]) {
      return // Already fetched
    }

    try {
      setLoadingDoctors((prev) => ({ ...prev, [hospitalId]: true }))
      const response = await axios.get(`${API_URL}/api/doctors/hospital/${hospitalId}`)
      setHospitalDoctors((prev) => ({ ...prev, [hospitalId]: response.data }))
    } catch (err) {
      console.error(`Error fetching doctors for hospital ${hospitalId}:`, err)
    } finally {
      setLoadingDoctors((prev) => ({ ...prev, [hospitalId]: false }))
    }
  }

  const toggleHospitalExpand = (hospitalId) => {
    if (expandedHospital === hospitalId) {
      setExpandedHospital(null)
    } else {
      setExpandedHospital(hospitalId)
      fetchDoctorsForHospital(hospitalId)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-accent text-4xl" />
      </div>
    )
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary mb-8">Our Partner Hospitals</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hospitals.map((hospital) => (
          <div key={hospital._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-primary mb-2">{hospital.name}</h2>
                  <p className="flex items-center text-gray-600 mb-1">
                    <FaMapMarkerAlt className="mr-2 text-accent" />
                    {hospital.address?.city}, {hospital.address?.state}
                  </p>
                  <p className="flex items-center text-gray-600 mb-1">
                    <FaPhone className="mr-2 text-accent" />
                    {hospital.contactInfo?.phone}
                  </p>
                  <p className="flex items-center text-gray-600">
                    <FaEnvelope className="mr-2 text-accent" />
                    {hospital.contactInfo?.email}
                  </p>
                </div>
                <div className="bg-accent bg-opacity-10 p-2 rounded-full">
                  <FaHospital className="text-accent text-2xl" />
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-medium text-gray-700 mb-1">Departments</h3>
                <div className="flex flex-wrap gap-2">
                  {hospital.departments?.map((dept, index) => (
                    <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                      {dept}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => toggleHospitalExpand(hospital._id)}
                className="mt-4 w-full bg-primary text-white py-2 rounded-md hover:bg-accent transition"
              >
                {expandedHospital === hospital._id ? "Hide Doctors" : "View Doctors"}
              </button>

              {expandedHospital === hospital._id && (
                <div className="mt-4 border-t pt-4">
                  <h3 className="font-medium text-gray-700 mb-2">Hospital Doctors</h3>

                  {loadingDoctors[hospital._id] ? (
                    <div className="flex justify-center py-4">
                      <FaSpinner className="animate-spin text-accent" />
                    </div>
                  ) : hospitalDoctors[hospital._id]?.length > 0 ? (
                    <div className="space-y-3">
                      {hospitalDoctors[hospital._id].map((doctor) => (
                        <div key={doctor._id} className="flex items-center p-2 bg-gray-50 rounded">
                          <div className="bg-primary rounded-full p-2 mr-3">
                            <FaUserMd className="text-white" />
                          </div>
                          <div>
                            <p className="font-medium">Dr. {doctor.user?.name || "Unknown"}</p>
                            <p className="text-sm text-gray-600">{doctor.specialization}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-2">No doctors found for this hospital.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Hospitals
