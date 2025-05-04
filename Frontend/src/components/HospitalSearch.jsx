"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { FaSearch, FaMapMarkerAlt, FaPhone, FaEnvelope, FaGlobe, FaBuilding, FaList, FaMap } from "react-icons/fa"
import HospitalMap from "./HospitalMap"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

const HospitalSearch = ({ onSelectHospital }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [hospitals, setHospitals] = useState([])
  const [filteredHospitals, setFilteredHospitals] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedHospital, setSelectedHospital] = useState(null)
  const [viewMode, setViewMode] = useState("list") // "list" or "map"
  const [userLocation, setUserLocation] = useState(null)

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation({ lat: latitude, lng: longitude })
        },
        (error) => {
          console.error("Error getting location:", error)
        },
      )
    }

    const fetchHospitals = async () => {
      setLoading(true)
      setError("")

      try {
        const response = await axios.get(`${API_URL}/api/hospitals`)
        setHospitals(response.data)
        setFilteredHospitals(response.data)
      } catch (err) {
        console.error("Error fetching hospitals:", err)
        setError("Failed to load hospitals. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchHospitals()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredHospitals(hospitals)
      return
    }

    const filtered = hospitals.filter(
      (hospital) =>
        hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hospital.address?.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hospital.address?.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (hospital.departments &&
          hospital.departments.some((dept) => dept.toLowerCase().includes(searchTerm.toLowerCase()))),
    )

    setFilteredHospitals(filtered)
  }, [searchTerm, hospitals])

  const handleHospitalSelect = (hospital) => {
    setSelectedHospital(hospital)
    if (onSelectHospital) {
      onSelectHospital(hospital)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    // The filtering is already handled by the useEffect
  }

  const searchNearbyHospitals = async () => {
    if (!userLocation) {
      setError("Location access is required to find nearby hospitals")
      return
    }

    setLoading(true)
    setError("")

    try {
      const { lat, lng } = userLocation
      const response = await axios.get(`${API_URL}/api/hospitals/near?lat=${lat}&lng=${lng}&radius=20`)
      setHospitals(response.data)
      setFilteredHospitals(response.data)
      setViewMode("map") // Switch to map view
    } catch (err) {
      console.error("Error fetching nearby hospitals:", err)
      setError("Failed to load nearby hospitals. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Find a Hospital</h2>

      <div className="mb-6">
        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, city, or department..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-accent text-white px-3 py-1 rounded-md text-sm hover:bg-primary transition"
            >
              Search
            </button>
          </div>
        </form>

        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center px-3 py-1 rounded-md ${
                viewMode === "list" ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FaList className="mr-1" />
              List View
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center px-3 py-1 rounded-md ${
                viewMode === "map" ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FaMap className="mr-1" />
              Map View
            </button>
          </div>

          <button
            onClick={searchNearbyHospitals}
            className="flex items-center bg-accent text-white px-3 py-1 rounded-md hover:bg-primary transition"
            disabled={!userLocation}
          >
            <FaMapMarkerAlt className="mr-1" />
            Nearby Hospitals
          </button>
        </div>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {loading ? (
        <div className="text-center py-4">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading hospitals...</p>
        </div>
      ) : (
        <div>
          {viewMode === "list" ? (
            filteredHospitals.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No hospitals found matching your search criteria.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredHospitals.map((hospital) => (
                  <div
                    key={hospital._id}
                    className={`border rounded-lg p-4 hover:shadow-md transition cursor-pointer ${
                      selectedHospital?._id === hospital._id ? "border-accent bg-blue-50" : ""
                    }`}
                    onClick={() => handleHospitalSelect(hospital)}
                  >
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{hospital.name}</h3>
                    <div className="space-y-1 text-sm">
                      <p className="flex items-start">
                        <FaMapMarkerAlt className="text-gray-500 mr-2 mt-1 flex-shrink-0" />
                        <span>
                          {hospital.address?.street}, {hospital.address?.city}, {hospital.address?.state}{" "}
                          {hospital.address?.zipCode}
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
                          <span>{hospital.contactInfo.website}</span>
                        </p>
                      )}
                      {hospital.departments && hospital.departments.length > 0 && (
                        <p className="flex items-start">
                          <FaBuilding className="text-gray-500 mr-2 mt-1 flex-shrink-0" />
                          <span>{hospital.departments.slice(0, 3).join(", ")}</span>
                          {hospital.departments.length > 3 && <span> and {hospital.departments.length - 3} more</span>}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <HospitalMap selectedHospital={selectedHospital} onSelectHospital={handleHospitalSelect} />
          )}
        </div>
      )}
    </div>
  )
}

export default HospitalSearch
