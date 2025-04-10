"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import {
  FaCalendarAlt,
  FaClipboardList,
  FaUserCircle,
  FaHospital,
  FaSignOutAlt,
  FaBell,
  FaSearch,
  FaExchangeAlt,
  FaFileMedical,
  FaUserMd,
  FaUsers,
} from "react-icons/fa"

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview")
  const [userData, setUserData] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [referrals, setReferrals] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        navigate("/login")
        return
      }

      try {
        setLoading(true)
        // Fetch user profile data
        const userResponse = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })

        setUserData(userResponse.data)

        // Fetch appointments
        const appointmentsResponse = await axios.get("http://localhost:5000/api/appointments/doctor", {
          headers: { Authorization: `Bearer ${token}` },
        })

        setAppointments(appointmentsResponse.data)

        // Fetch referrals (both made by this doctor and to this doctor)
        const referringResponse = await axios.get("http://localhost:5000/api/referrals/referring", {
          headers: { Authorization: `Bearer ${token}` },
        })

        const referredResponse = await axios.get("http://localhost:5000/api/referrals/referred", {
          headers: { Authorization: `Bearer ${token}` },
        })

        setReferrals([...referringResponse.data, ...referredResponse.data])

        // Fetch patients
        const patientsResponse = await axios.get("http://localhost:5000/api/patients", {
          headers: { Authorization: `Bearer ${token}` },
        })

        setPatients(patientsResponse.data)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load dashboard data. Please try again.")
        if (err.response?.status === 401) {
          localStorage.removeItem("token")
          navigate("/login")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/login")
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-light flex flex-col md:flex-row">
      {/* Sidebar - similar to patient dashboard but with doctor-specific options */}
      <div className="bg-white w-full md:w-64 shadow-md md:min-h-screen">
        <div className="p-4 border-b">
          <h2 className="text-2xl font-bold text-primary">MEDREF</h2>
          <p className="text-sm text-gray-500">Doctor Portal</p>
        </div>

        <div className="p-4">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-primary rounded-full w-10 h-10 flex items-center justify-center text-white">
              <FaUserMd size={24} />
            </div>
            <div>
              <p className="font-medium">Dr. {userData?.name || "Doctor"}</p>
              <p className="text-xs text-gray-500">{userData?.doctorData?.specialization || "Specialist"}</p>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center space-x-3 p-3 rounded-md transition ${
                activeTab === "overview" ? "bg-primary text-white" : "hover:bg-gray-100"
              }`}
            >
              <FaClipboardList />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab("appointments")}
              className={`w-full flex items-center space-x-3 p-3 rounded-md transition ${
                activeTab === "appointments" ? "bg-primary text-white" : "hover:bg-gray-100"
              }`}
            >
              <FaCalendarAlt />
              <span>Appointments</span>
            </button>

            <button
              onClick={() => setActiveTab("patients")}
              className={`w-full flex items-center space-x-3 p-3 rounded-md transition ${
                activeTab === "patients" ? "bg-primary text-white" : "hover:bg-gray-100"
              }`}
            >
              <FaUsers />
              <span>Patients</span>
            </button>

            <button
              onClick={() => setActiveTab("referrals")}
              className={`w-full flex items-center space-x-3 p-3 rounded-md transition ${
                activeTab === "referrals" ? "bg-primary text-white" : "hover:bg-gray-100"
              }`}
            >
              <FaExchangeAlt />
              <span>Referrals</span>
            </button>

            <button
              onClick={() => setActiveTab("hospitals")}
              className={`w-full flex items-center space-x-3 p-3 rounded-md transition ${
                activeTab === "hospitals" ? "bg-primary text-white" : "hover:bg-gray-100"
              }`}
            >
              <FaHospital />
              <span>Hospitals</span>
            </button>

            <button
              onClick={() => setActiveTab("records")}
              className={`w-full flex items-center space-x-3 p-3 rounded-md transition ${
                activeTab === "records" ? "bg-primary text-white" : "hover:bg-gray-100"
              }`}
            >
              <FaFileMedical />
              <span>Medical Records</span>
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center space-x-3 p-3 rounded-md transition ${
                activeTab === "profile" ? "bg-primary text-white" : "hover:bg-gray-100"
              }`}
            >
              <FaUserCircle />
              <span>My Profile</span>
            </button>
          </nav>
        </div>

        <div className="p-4 border-t mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 p-3 rounded-md hover:bg-gray-100 text-red-500 transition"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content - similar structure to patient dashboard but with doctor-specific content */}
      <div className="flex-1 p-6">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {activeTab === "overview"
                ? "Doctor Dashboard"
                : activeTab === "appointments"
                  ? "Appointments"
                  : activeTab === "patients"
                    ? "My Patients"
                    : activeTab === "referrals"
                      ? "Referrals"
                      : activeTab === "hospitals"
                        ? "Hospitals"
                        : activeTab === "records"
                          ? "Medical Records"
                          : "My Profile"}
            </h1>
            <p className="text-gray-500">
              Welcome back, Dr. {userData?.name || "Doctor"}. Here's your practice overview.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex space-x-2">
            <button className="flex items-center space-x-2 bg-white p-2 rounded-md shadow-sm">
              <FaBell className="text-gray-400" />
              <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                5
              </span>
            </button>
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Doctor-specific dashboard content would go here */}
        {/* This would be similar to the patient dashboard but with doctor-specific cards and data */}
      </div>
    </div>
  )
}

export default DoctorDashboard
