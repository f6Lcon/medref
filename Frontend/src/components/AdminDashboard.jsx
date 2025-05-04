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
  FaTimes,
} from "react-icons/fa"
import LoginContext from "../context/LoginContext"
import AddHospitalForm from "./AddHospitalForm"
import AddDoctorForm from "./AddDoctorForm"
import ReportGenerator from "./ReportGenerator"
import EditUserModal from "./EditUserModal"

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
  const [appointments, setAppointments] = useState([])
  const [referrals, setReferrals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showAddDoctorForm, setShowAddDoctorForm] = useState(false)
  const navigate = useNavigate()
  const { setIsLoggedIn, setUserRole } = useContext(LoginContext)

  const [editingUser, setEditingUser] = useState(null)
  const [deletingUser, setDeletingUser] = useState(null)
  const [userActionLoading, setUserActionLoading] = useState(false)

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

      // Fetch all users
      try {
        const usersResponse = await axios.get(`${API_URL}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setUsers(usersResponse.data || [])
      } catch (err) {
        console.error("Error fetching users:", err)
        // If the endpoint doesn't exist yet, we'll create a mock list from doctors and patients
        const mockUsers = []
        setUsers(mockUsers)
      }

      // Fetch doctors
      let doctorsResponse
      try {
        doctorsResponse = await axios.get(`${API_URL}/api/doctors`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setDoctors(doctorsResponse.data)

        // Add doctors to mock users if needed
        if (users.length === 0) {
          doctorsResponse.data.forEach((doctor) => {
            if (doctor.user) {
              users.push({
                ...doctor.user,
                role: "doctor",
                details: doctor,
              })
            }
          })
        }
      } catch (err) {
        console.error("Error fetching doctors:", err)
      }

      // Fetch patients
      let patientsResponse
      try {
        patientsResponse = await axios.get(`${API_URL}/api/patients`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setPatients(patientsResponse.data)

        // Add patients to mock users if needed
        if (users.length === 0) {
          patientsResponse.data.forEach((patient) => {
            if (patient.user) {
              users.push({
                ...patient.user,
                role: "patient",
                details: patient,
              })
            }
          })
        }
      } catch (err) {
        console.error("Error fetching patients:", err)
      }

      // Fetch hospitals
      let hospitalsResponse
      try {
        hospitalsResponse = await axios.get(`${API_URL}/api/hospitals`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setHospitals(hospitalsResponse.data)
      } catch (err) {
        console.error("Error fetching hospitals:", err)
      }

      // Fetch appointments
      try {
        // For admin, we'd need a special endpoint to get all appointments
        const appointmentsResponse = await axios.get(`${API_URL}/api/appointments/all`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setAppointments(appointmentsResponse.data || [])
      } catch (err) {
        console.error("Error fetching appointments:", err)
        // If the endpoint doesn't exist yet, we'll just use an empty array
        setAppointments([])
      }

      // Fetch referrals
      try {
        // For admin, we'd need a special endpoint to get all referrals
        const referralsResponse = await axios.get(`${API_URL}/api/referrals/all`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setReferrals(referralsResponse.data || [])
      } catch (err) {
        console.error("Error fetching referrals:", err)
        // If the endpoint doesn't exist yet, we'll just use an empty array
        setReferrals([])
      }

      // Set statistics
      setStats({
        totalPatients: patientsResponse?.data?.length || 0,
        totalDoctors: doctorsResponse?.data?.length || 0,
        totalAppointments: appointments.length || 0,
        totalReferrals: referrals.length || 0,
        totalHospitals: hospitalsResponse?.data?.length || 0,
      })
    } catch (err) {
      console.error("Error fetching data:", err)
      setError("Failed to load dashboard data. Please try again.")
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

  useEffect(() => {
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

  const handleDoctorSuccess = (newDoctor) => {
    setDoctors([newDoctor, ...doctors])
    setShowAddDoctorForm(false)
    alert("Doctor added successfully!")
  }

  const [newDoctorData, setNewDoctorData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    specialization: "",
    licenseNumber: "",
    hospital: "",
  })

  const handleAddDoctor = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("You must be logged in to add a doctor")
        setLoading(false)
        return
      }

      // First create a user with doctor role
      const userResponse = await axios.post(
        `${API_URL}/api/auth/register`,
        {
          name: newDoctorData.name,
          email: newDoctorData.email,
          username: newDoctorData.username || newDoctorData.email.split("@")[0], // Add username field
          password: newDoctorData.password,
          role: "doctor",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      console.log("User created:", userResponse.data)

      // Then create the doctor profile
      const doctorResponse = await axios.post(
        `${API_URL}/api/doctors`,
        {
          email: newDoctorData.email,
          specialization: newDoctorData.specialization,
          licenseNumber: newDoctorData.licenseNumber,
          hospital: newDoctorData.hospital,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      )

      console.log("Doctor profile created:", doctorResponse.data)

      // Reset form and refresh data
      setNewDoctorData({
        name: "",
        email: "",
        username: "",
        password: "",
        specialization: "",
        licenseNumber: "",
        hospital: "",
      })
      setShowAddDoctorForm(false)
      fetchData()
      alert("Doctor added successfully!")
    } catch (err) {
      console.error("Error adding doctor:", err)
      setError(err.response?.data?.message || "Failed to add doctor. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
  }

  const handleUpdateUser = async (userId, updatedData) => {
    try {
      setUserActionLoading(true)
      setError("")

      const token = localStorage.getItem("token")
      if (!token) {
        setError("You must be logged in to update users")
        setUserActionLoading(false)
        return
      }

      const response = await axios.put(`${API_URL}/api/users/${userId}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Update the users list with the updated user
      setUsers(users.map((user) => (user._id === userId ? { ...user, ...updatedData } : user)))

      setEditingUser(null)
      alert("User updated successfully!")
    } catch (err) {
      console.error("Error updating user:", err)
      setError(err.response?.data?.message || "Failed to update user")
    } finally {
      setUserActionLoading(false)
    }
  }

  const handleDeleteUser = (user) => {
    setDeletingUser(user)
  }

  const confirmDeleteUser = async () => {
    try {
      setUserActionLoading(true)
      setError("")

      const token = localStorage.getItem("token")
      if (!token) {
        setError("You must be logged in to delete users")
        setUserActionLoading(false)
        return
      }

      await axios.delete(`${API_URL}/api/users/${deletingUser._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Remove the deleted user from the users list
      setUsers(users.filter((user) => user._id !== deletingUser._id))

      setDeletingUser(null)
      alert("User deleted successfully!")
    } catch (err) {
      console.error("Error deleting user:", err)
      setError(err.response?.data?.message || "Failed to delete user")
    } finally {
      setUserActionLoading(false)
    }
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
                {appointments.slice(0, 3).map((appointment, index) => (
                  <div key={appointment._id || index} className="flex items-start">
                    <div className="bg-purple-100 p-2 rounded-full mr-3">
                      <FaCalendarAlt className="text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Appointment scheduled</p>
                      <p className="text-xs text-gray-500">
                        Dr. {appointment.doctor?.user?.name || "Unknown"} has a new appointment with{" "}
                        {appointment.patient?.user?.name || "Unknown Patient"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(appointment.date)} at {appointment.time}
                      </p>
                    </div>
                  </div>
                ))}

                {referrals.slice(0, 2).map((referral, index) => (
                  <div key={referral._id || index} className="flex items-start">
                    <div className="bg-yellow-100 p-2 rounded-full mr-3">
                      <FaExchangeAlt className="text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">New referral created</p>
                      <p className="text-xs text-gray-500">
                        Dr. {referral.referringDoctor?.user?.name || "Unknown"} referred a patient to Dr.{" "}
                        {referral.referredToDoctor?.user?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-400">{formatDate(referral.createdAt || new Date())}</p>
                    </div>
                  </div>
                ))}
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

        {/* User Management Tab */}
        {activeTab === "users" && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {doctors.map((doctor) => (
                    <tr key={`doctor-${doctor._id}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <FaUserMd className="text-gray-500" size={20} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              Dr. {doctor.user?.name || "Unknown"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{doctor.email || doctor.user?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{doctor.user?.username || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Doctor
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditUser(doctor.user)}
                          className="text-primary hover:text-accent mr-3"
                        >
                          <FaEdit /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(doctor.user)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}

                  {patients.map((patient) => (
                    <tr key={`patient-${patient._id}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <FaUserCircle className="text-gray-500" size={20} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{patient.user?.name || "Unknown"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{patient.email || patient.user?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{patient.user?.username || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          Patient
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditUser(patient.user)}
                          className="text-primary hover:text-accent mr-3"
                        >
                          <FaEdit /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(patient.user)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
            {showAddDoctorForm ? (
              <div className="relative">
                <button
                  onClick={() => setShowAddDoctorForm(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={20} />
                </button>
                <AddDoctorForm
                  onSuccess={handleDoctorSuccess}
                  onCancel={() => setShowAddDoctorForm(false)}
                  handleAddDoctor={handleAddDoctor}
                  newDoctorData={newDoctorData}
                  setNewDoctorData={setNewDoctorData}
                  loading={loading}
                  error={error}
                />
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Doctor Management</h2>
                  <button
                    onClick={() => setShowAddDoctorForm(true)}
                    className="bg-primary text-white py-2 px-4 rounded-md hover:bg-accent transition flex items-center"
                  >
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
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div className="space-y-6">
            <ReportGenerator />
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
                            <button
                              onClick={() => handleEditUser(patient.user)}
                              className="text-primary hover:text-accent mr-3"
                            >
                              <FaEdit /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteUser(patient.user)}
                              className="text-red-600 hover:text-red-900"
                            >
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

        {/* Appointments Tab */}
        {activeTab === "appointments" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Appointment Management</h2>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search appointments..."
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
                        Doctor
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date & Time
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
                        Status
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
                    {appointments.length > 0 ? (
                      appointments.map((appointment) => (
                        <tr key={appointment._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {appointment.patient?.user?.name || "Unknown"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              Dr. {appointment.doctor?.user?.name || "Unknown"}
                            </div>
                            <div className="text-xs text-gray-500">{appointment.doctor?.specialization}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDate(appointment.date)}</div>
                            <div className="text-xs text-gray-500">{appointment.time}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{appointment.hospital?.name || "Unknown"}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                appointment.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : appointment.status === "scheduled"
                                    ? "bg-blue-100 text-blue-800"
                                    : appointment.status === "cancelled"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1) || "Unknown"}
                            </span>
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
                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                          No appointments found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">System Settings</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">General Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">System Name</label>
                      <input
                        type="text"
                        value="MEDREF - Medical Referral System"
                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
                      <input
                        type="email"
                        value="admin@medref.com"
                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Security Settings</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input type="checkbox" id="2fa" className="mr-2" />
                      <label htmlFor="2fa" className="text-sm text-gray-700">
                        Enable Two-Factor Authentication
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="session" className="mr-2" checked />
                      <label htmlFor="session" className="text-sm text-gray-700">
                        Limit Session Duration (30 days)
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="audit" className="mr-2" checked />
                      <label htmlFor="audit" className="text-sm text-gray-700">
                        Enable Audit Logging
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Email Notifications</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input type="checkbox" id="email-new-user" className="mr-2" checked />
                      <label htmlFor="email-new-user" className="text-sm text-gray-700">
                        New User Registration
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="email-appointment" className="mr-2" checked />
                      <label htmlFor="email-appointment" className="text-sm text-gray-700">
                        New Appointment
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="email-referral" className="mr-2" checked />
                      <label htmlFor="email-referral" className="text-sm text-gray-700">
                        New Referral
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <button className="bg-primary text-white py-2 px-4 rounded-md hover:bg-accent transition">
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleUpdateUser}
          loading={userActionLoading}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Confirm Deletion</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the user <span className="font-semibold">{deletingUser.name}</span>? This
              action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                disabled={userActionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {userActionLoading ? "Deleting..." : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
