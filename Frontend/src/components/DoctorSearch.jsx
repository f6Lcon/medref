"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { FaSearch, FaUserMd, FaHospital, FaFilter, FaStar } from "react-icons/fa"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

const DoctorSearch = ({ onSelectDoctor }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [doctors, setDoctors] = useState([])
  const [filteredDoctors, setFilteredDoctors] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [specializations, setSpecializations] = useState([])
  const [selectedSpecialization, setSelectedSpecialization] = useState("")
  const [hospitals, setHospitals] = useState([])
  const [selectedHospital, setSelectedHospital] = useState("")

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true)
      setError("")

      try {
        const response = await axios.get(`${API_URL}/api/doctors`)
        setDoctors(response.data)
        setFilteredDoctors(response.data)

        // Extract unique specializations
        const uniqueSpecializations = [...new Set(response.data.map((doctor) => doctor.specialization))].filter(Boolean)
        setSpecializations(uniqueSpecializations)

        // Fetch hospitals
        const hospitalsResponse = await axios.get(`${API_URL}/api/hospitals`)
        setHospitals(hospitalsResponse.data)
      } catch (err) {
        console.error("Error fetching doctors:", err)
        setError("Failed to load doctors. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  useEffect(() => {
    let filtered = [...doctors]

    // Filter by search term
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (doctor) =>
          doctor.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by specialization
    if (selectedSpecialization) {
      filtered = filtered.filter((doctor) => doctor.specialization === selectedSpecialization)
    }

    // Filter by hospital
    if (selectedHospital) {
      filtered = filtered.filter((doctor) => doctor.hospital?._id === selectedHospital)
    }

    setFilteredDoctors(filtered)
  }, [searchTerm, selectedSpecialization, selectedHospital, doctors])

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor)
    if (onSelectDoctor) {
      onSelectDoctor(doctor)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    // The filtering is already handled by the useEffect
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    setSelectedSpecialization("")
    setSelectedHospital("")
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Find a Doctor</h2>

      <form onSubmit={handleSearch} className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or specialization..."
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

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center">
          <FaFilter className="text-gray-500 mr-2" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>
        </div>

        <div className="flex-1">
          <select
            value={selectedSpecialization}
            onChange={(e) => setSelectedSpecialization(e.target.value)}
            className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-sm"
          >
            <option value="">All Specializations</option>
            {specializations.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <select
            value={selectedHospital}
            onChange={(e) => setSelectedHospital(e.target.value)}
            className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-sm"
          >
            <option value="">All Hospitals</option>
            {hospitals.map((hospital) => (
              <option key={hospital._id} value={hospital._id}>
                {hospital.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleClearFilters}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-100 transition"
        >
          Clear Filters
        </button>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {loading ? (
        <div className="text-center py-4">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading doctors...</p>
        </div>
      ) : (
        <div>
          {filteredDoctors.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No doctors found matching your search criteria.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDoctors.map((doctor) => (
                <div
                  key={doctor._id}
                  className={`border rounded-lg p-4 hover:shadow-md transition cursor-pointer ${
                    selectedDoctor?._id === doctor._id ? "border-accent bg-blue-50" : ""
                  }`}
                  onClick={() => handleDoctorSelect(doctor)}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                      <FaUserMd className="text-gray-500" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Dr. {doctor.user?.name || "Unknown"}</h3>
                      <p className="text-sm text-accent font-medium">{doctor.specialization}</p>
                      {doctor.hospital && (
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <FaHospital className="mr-1" size={12} /> {doctor.hospital.name}
                        </p>
                      )}
                      {doctor.experience && doctor.experience.length > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                          <FaStar className="inline mr-1 text-yellow-500" size={12} />{" "}
                          {doctor.experience.length > 0
                            ? `${doctor.experience.length} years of experience`
                            : "New doctor"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default DoctorSearch
