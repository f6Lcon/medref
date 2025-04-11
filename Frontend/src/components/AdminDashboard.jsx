"use client"

import { useState, useEffect, useContext } from "react"
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
  FaUsers,
  FaUserMd,
  FaCog,
  FaChartLine,
  FaDatabase,
  FaUserShield,
  FaExchangeAlt,
  FaPlus,
  FaEdit,
  FaTrash,
} from "react-icons/fa"
import LoginContext from "../context/LoginContext"
import AddHospitalForm from "./AddHospitalForm"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview")
  const [userData, setUserData] = useState(null)
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    totalReferrals: 0,
    totalHospitals: 0,
  })
  const [users, setUsers] = useState([])
  const [doctors, setDoctors] = useState([])
  const [patients, setPatients] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const { setIsLoggedIn, setUserRole } = useContext(LoginContext)

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
        const userResponse = await axios.get(`${API_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        setUserData(userResponse.data)

        // Fetch system statistics and data
        // In a real application, you would have endpoints for these
        // For now, we'll make multiple requests to simulate this

        // Fetch doctors
        const doctorsResponse = await axios.get(`${API_URL}/api/doctors`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setDoctors(doctorsResponse.data)

        // Fetch patients
        const patientsResponse = await axios.get(`${API_URL}/api/patients`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setPatients(patientsResponse.data)

        // Fetch hospitals
        const hospitalsResponse = await axios.get(`${API_URL}/api/hospitals`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setHospitals(hospitalsResponse.data)

        // Set statistics
        setStats({
          totalPatients: patientsResponse.data.length,
          totalDoctors: doctorsResponse.data.length,
          totalAppointments: 3750, // Placeholder
          totalReferrals: 620, // Placeholder
          totalHospitals: hospitalsResponse.data.length,
        })
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load dashboard data.  Please try again.")
        if (err.response?.status === 401) {
          localStorage.removeItem("token")
          localStorage.removeItem("userRole")
          setIsLoggedIn(false)
          setUserRole(null)
          navigate("/login")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [navigate, setIsLoggedIn, setUserRole])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userRole")
    setIsLoggedIn(false)
    setUserRole(null)
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
      {/* Sidebar */}
      <div className="bg-white w-full md:w-64 shadow-md md:min-h-screen">
        <div className="p-4 border-b">
          <h2 className="text-2xl font-bold text-primary">MEDREF</h2>
          <p className="text-sm text-gray-500">Admin Portal</p>
        </div>

        <div className="p-4">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-primary rounded-full w-10 h-10 flex items-center justify-center text-white">
              <FaUserShield size={24} />
            </div>
            <div>
              <p className="font-medium">{userData?.name || "Administrator"}</p>
              <p className="text-xs text-gray-500">{userData?.email || ""}</p>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center space-x-3 p-3 rounded-md transition ${
                activeTab === "overview" ? "bg-primary text-white" : "hover:bg-gray-100"
              }`}
            >
              <FaChartLine />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab("users")}
              className={`w-full flex items-center space-x-3 p-3 rounded-md transition ${
                activeTab === "users" ? "bg-primary text-white" : "hover:bg-gray-100"
              }`}
            >
              <FaUsers />
              <span>User Management</span>
            </button>

            <button
              onClick={() => setActiveTab("doctors")}
              className={`w-full flex items-center space-x-3 p-3 rounded-md transition ${
                activeTab === "doctors" ? "bg-primary text-white" : "hover:bg-gray-100"
              }`}
            >
              <FaUserMd />
              <span>Doctors</span>
            </button>

            <button
              onClick={() => setActiveTab("patients")}
              className={`w-full flex items-center space-x-3 p-3 rounded-md transition ${
                activeTab === "patients" ? "bg-primary text-white" : "hover:bg-gray-100"
              }`}
            >
              <FaUserCircle />
              <span>Patients</span>
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
              onClick={() => setActiveTab("hospitals")}
              className={`w-full flex items-center space-x-3 p-3 rounded-md transition ${
                activeTab === "hospitals" ? "bg-primary text-white" : "hover:bg-gray-100"
              }`}
            >
              <FaHospital />
              <span>Hospitals</span>
            </button>

            <button
              onClick={() => setActiveTab("reports")}
              className={`w-full flex items-center space-x-3 p-3 rounded-md transition ${
                activeTab === "reports" ? "bg-primary text-white" : "hover:bg-gray-100"
              }`}
            >
              <FaClipboardList />
              <span>Reports</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center space-x-3 p-3 rounded-md transition ${
                activeTab === "settings" ? "bg-primary text-white" : "hover:bg-gray-100"
              }`}
            >
              <FaCog />
              <span>System Settings</span>
            </button>

            <button
              onClick={() => setActiveTab("database")}
              className={`w-full flex items-center space-x-3 p-3 rounded-md transition ${
                activeTab === "database" ? "bg-primary text-white" : "hover:bg-gray-100"
              }`}
            >
              <FaDatabase />
              <span>Database</span>
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

      {/* Main Content */}
      <div className="flex-1 p-6">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {activeTab === "overview"
                ? "Admin Dashboard"
                : activeTab === "users"
                  ? "User Management"
                  : activeTab === "doctors"
                    ? "Doctor Management"
                    : activeTab === "patients"
                      ? "Patient Management"
                      : activeTab === "appointments"
                        ? "Appointment Management"
                        : activeTab === "hospitals"
                          ? "Hospital Management"
                          : activeTab === "reports"
                            ? "System Reports"
                            : activeTab === "settings"
                              ? "System Settings"
                              : "Database Management"}
            </h1>
            <p className="text-gray-500">
              Welcome back, {userData?.name || "Administrator"}. Here's your system overview.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex space-x-2">
            <button className="flex items-center space-x-2 bg-white p-2 rounded-md shadow-sm">
              <FaBell className="text-gray-400" />
              <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                7
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

        {/* Dashboard Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Patients</p>
                    <h3 className="text-2xl font-bold text-gray-800">{stats.totalPatients}</h3>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FaUsers className="text-blue-500" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-green-500 text-sm">+5.2%</span>
                  <span className="text-gray-500 text-sm"> from last month</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Doctors</p>
                    <h3 className="text-2xl font-bold text-gray-800">{stats.totalDoctors}</h3>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <FaUserMd className="text-green-500" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-green-500 text-sm">+2.1%</span>
                  <span className="text-gray-500 text-sm"> from last month</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Appointments</p>
                    <h3 className="text-2xl font-bold text-gray-800">{stats.totalAppointments}</h3>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <FaCalendarAlt className="text-purple-500" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-green-500 text-sm">+12.5%</span>
                  <span className="text-gray-500 text-sm"> from last month</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Referrals</p>
                    <h3 className="text-2xl font-bold text-gray-800">{stats.totalReferrals}</h3>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <FaExchangeAlt className="text-yellow-500" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-green-500 text-sm">+8.3%</span>
                  <span className="text-gray-500 text-sm"> from last month</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Hospitals</p>
                    <h3 className="text-2xl font-bold text-gray-800">{stats.totalHospitals}</h3>
                  </div>
                  <div className="bg-red-100 p-3 rounded-full">
                    <FaHospital className="text-red-500" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-gray-500 text-sm">No change</span>
                  <span className="text-gray-500 text-sm"> from last month</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
                <button className="text-primary hover:underline text-sm font-medium">View All</button>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <FaUserCircle className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">New patient registered</p>
                    <p className="text-xs text-gray-500">John Doe created an account</p>
                    <p className="text-xs text-gray-400">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-full mr-3">
                    <FaUserMd className="text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">New doctor approved</p>
                    <p className="text-xs text-gray-500">Dr. Sarah Johnson's account was approved</p>
                    <p className="text-xs text-gray-400">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-purple-100 p-2 rounded-full mr-3">
                    <FaCalendarAlt className="text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Appointment scheduled</p>
                    <p className="text-xs text-gray-500">Dr. Williams has a new appointment with Mary Smith</p>
                    <p className="text-xs text-gray-400">Yesterday at 3:45 PM</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-yellow-100 p-2 rounded-full mr-3">
                    <FaExchangeAlt className="text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">New referral created</p>
                    <p className="text-xs text-gray-500">Dr. Brown referred a patient to Dr. Taylor</p>
                    <p className="text-xs text-gray-400">Yesterday at 11:20 AM</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-red-100 p-2 rounded-full mr-3">
                    <FaHospital className="text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Hospital information updated</p>
                    <p className="text-xs text-gray-500">Central Hospital updated their contact information</p>
                    <p className="text-xs text-gray-400">2 days ago</p>
                  </div>
                </div>
              </div>
            </div>

            {/* System Health */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">System Health</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Server Uptime</span>
                    <span className="text-sm font-medium text-gray-700">99.9%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: "99.9%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Database Performance</span>
                    <span className="text-sm font-medium text-gray-700">92%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: "92%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">API Response Time</span>
                    <span className="text-sm font-medium text-gray-700">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: "85%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Storage Usage</span>
                    <span className="text-sm font-medium text-gray-700">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: "45%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hospital Management Tab */}
        {activeTab === "hospitals" && (
          <div className="space-y-6">
            <AddHospitalForm
              onSuccess={(hospitalData) => {
                // Add the new hospital to the list
                setHospitals([hospitalData, ...hospitals])
              }}
            />

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Hospital Management</h2>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search hospitals..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Hospital Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Location
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Contact
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Departments
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {hospitals.length > 0 ? (
                      hospitals.map((hospital) => (
                        <tr key={hospital._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{hospital.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {hospital.address?.city}, {hospital.address?.state}
                            </div>
                            <div className="text-xs text-gray-500">
                              {hospital.address?.street}, {hospital.address?.zipCode}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{hospital.contactInfo?.email}</div>
                            <div className="text-sm text-gray-500">{hospital.contactInfo?.phone}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {hospital.departments?.slice(0, 3).join(", ")}
                              {hospital.departments?.length > 3 && "..."}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-primary hover:text-accent mr-3">
                              <FaEdit /> Edit
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <FaTrash /> Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                          No hospitals found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Doctor Management Tab */}
        {activeTab === "doctors" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Doctor Management</h2>
                <button className="bg-primary text-white py-2 px-4 rounded-md hover:bg-accent transition flex items-center">
                  <FaPlus className="mr-2" />
                  Add New Doctor
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Doctor
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Specialization
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Hospital
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Contact
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {doctors.length > 0 ? (
                      doctors.map((doctor) => (
                        <tr key={doctor._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <FaUserMd className="text-gray-500" size={20} />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  Dr. {doctor.user?.name || "Unknown"}
                                </div>
                                <div className="text-sm text-gray-500">{doctor.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{doctor.specialization}</div>
                            <div className="text-xs text-gray-500">License: {doctor.licenseNumber}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{doctor.hospital?.name || "Not Assigned"}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{doctor.contactInfo?.email}</div>
                            <div className="text-sm text-gray-500">{doctor.contactInfo?.phone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-primary hover:text-accent mr-3">
                              <FaEdit /> Edit
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <FaTrash /> Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                          No doctors found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Patient Management Tab */}
        {activeTab === "patients" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Patient Management</h2>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search patients..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Patient
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Demographics
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Contact
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Address
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {patients.length > 0 ? (
                      patients.map((patient) => (
                        <tr key={patient._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <FaUserCircle className="text-gray-500" size={20} />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {patient.user?.name || "Unknown"}
                                </div>
                                <div className="text-sm text-gray-500">{patient.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {patient.gender?.charAt(0).toUpperCase() + patient.gender?.slice(1) || "Unknown"}
                            </div>
                            <div className="text-sm text-gray-500">
                              DOB: {patient.dateOfBirth ? formatDate(patient.dateOfBirth) : "Unknown"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{patient.email}</div>
                            <div className="text-sm text-gray-500">{patient.phoneNumber}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {patient.address?.city}, {patient.address?.state}
                            </div>
                            <div className="text-xs text-gray-500">
                              {patient.address?.street}, {patient.address?.zipCode}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-primary hover:text-accent mr-3">
                              <FaEdit /> Edit
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <FaTrash /> Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                          No patients found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs would be implemented similarly */}
      </div>
    </div>
  )
}

export default AdminDashboard
